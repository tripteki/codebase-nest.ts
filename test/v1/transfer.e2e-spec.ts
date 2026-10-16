import { writeFileSync, readFileSync, } from "fs";
import { INestApplication, } from "@nestjs/common";
import { ConfigService, } from "@nestjs/config";
import { I18nService, } from "nestjs-i18n";
import { App, } from "supertest/types";
import request from "supertest";
import { join, } from "path";
import { setupTestApp, setupAuthTestApp, setdownTestApp, } from "test/test.case";
import { DatabasePrismaPostgreDriver, } from "src/app/drivers/database.driver";
import { AdminRefreshBroadcastListener, } from "src/v1/api/log/listeners/admin.refresh.broadcast.listener";
import { UserAdminActivatedBroadcastListener, } from "src/v1/api/user/listeners/user.admin.activated.broadcast.listener";
import { UserAdminExportedBroadcastListener, } from "src/v1/api/user/listeners/user.admin.exported.broadcast.listener";
import { UserAdminImportedBroadcastListener, } from "src/v1/api/user/listeners/user.admin.imported.broadcast.listener";
import { NotificationCreatedBroadcastListener, } from "src/v1/api/notification/listeners/notification.created.broadcast.listener";
import { AclAdminTransferBroadcastListener, } from "src/v1/api/acl/listeners/acl.admin.transfer.broadcast.listener";

describe ("Transfer (e2e)", (): void =>
{
    let app: INestApplication<App>;
    let token: string;
    let userId: string;
    const captured: { event: string; payload: Record<string, unknown>; room: string }[] = [];

    const spy = (listener: { serverBroadcaster: unknown }): void =>
    {
        listener.serverBroadcaster = {
            to: (room: string) => ({
                emit: (event: string, payload: Record<string, unknown>): void =>
                {
                    captured.push ({ event, payload, room, });
                },
            }),
        };
    };

    const waitFor = async (event: string): Promise<{ event: string; payload: Record<string, unknown>; room: string }> =>
    {
        const started = Date.now ();

        while (Date.now () - started < 10000) {
            const found = captured.find ((item) => item.event === event);

            if (found) return found;

            await new Promise ((resolve) => setTimeout (resolve, 100));
        }

        throw new Error (`missing realtime event ${event}`);
    };

    beforeAll (async (): Promise<void> =>
    {
        app = await setupTestApp ();
        const tokens = await setupAuthTestApp (app);

        token = tokens.accessToken;

        const prismaPostgreService: DatabasePrismaPostgreDriver = app.get (DatabasePrismaPostgreDriver);
        const user = await prismaPostgreService.user.findUnique ({ where: { email: "user@mail.com", }, });

        userId = user?.id || "";
        spy (app.get (UserAdminImportedBroadcastListener));
        spy (app.get (UserAdminExportedBroadcastListener));
        spy (app.get (NotificationCreatedBroadcastListener));
        spy (app.get (AdminRefreshBroadcastListener));
        spy (app.get (UserAdminActivatedBroadcastListener));
        spy (app.get (AclAdminTransferBroadcastListener));
    });

    afterAll (async (): Promise<void> =>
    {
        await setdownTestApp (app);
    });

    it ("import export and realtime match FastAPI", async (): Promise<void> =>
    {
        const i18nService: I18nService = app.get (I18nService);
        const email = `transfer-${userId.slice (-6).toLowerCase ()}-nest@test.com`;
        const name = `Transfer ${email.split ("@") [0]}`;
        const csvContent = `name,email,password,status\n${name},${email},password123,active\n`;

        const importedResponse = await request (app.getHttpServer ())
        .post ("/v1/admin/users/import")
        .set ("Authorization", `Bearer ${token}`)
        .attach ("file", Buffer.from (csvContent), "users.csv")
        .expect (200);

        expect (importedResponse.body).toBe (i18nService.t ("_v1_user.import.started.message"));
        expect (importedResponse.body).toBe ("Import started");

        const imported = await waitFor ("v1.user.admin.imported");

        expect (Object.keys (imported.payload).sort ()).toEqual ([ "filename", "totalImported", "totalSkipped", "userId", ].sort ());
        expect (imported.room).toBe (`user:${userId}`);
        expect (Number (imported.payload.totalImported) + Number (imported.payload.totalSkipped)).toBe (1);

        const created = await waitFor ("v1.notification.created");

        expect (Object.keys (created.payload).sort ()).toEqual ([ "id", "unread", ]);

        captured.length = 0;

        const exportedResponse = await request (app.getHttpServer ())
        .post ("/v1/admin/users/export")
        .query ({ export_type: "csv", })
        .set ("Authorization", `Bearer ${token}`)
        .expect (200);

        expect (exportedResponse.body).toBe ("Export started");

        const exported = await waitFor ("v1.user.admin.exported");

        expect (Object.keys (exported.payload).sort ()).toEqual ([ "fileUrl", "filename", "userId", ]);
        expect (String (exported.payload.filename).startsWith ("users_export_")).toBe (true);
        expect (String (exported.payload.filename).endsWith (".csv")).toBe (true);

        const configService: ConfigService = app.get (ConfigService);
        const exportPath = join (configService.get<string> ("storage.disks.public.path"), "export", String (exported.payload.filename));
        const lines = readFileSync (exportPath, "utf8").split ("\n").filter (Boolean);
        const header = lines [0];

        expect (header).toBe ("full_name,email,role,status,created_at");

        const sample = lines.slice (1).find ((line) => line.includes (email));

        expect (sample).toBeTruthy ();

        const [ fullName, sampleEmail, role, status, ] = String (sample).split (",");

        expect (fullName).toBe (name);
        expect (sampleEmail).toBe (email);
        expect (role).toBe ("user");
        expect (status).toBe ("active");

        captured.length = 0;

        const refreshListener = app.get (AdminRefreshBroadcastListener);

        refreshListener ["userAclRepository"] = {
            findUserIdsByPermissionNames: async (): Promise<string[]> => [ "other-user", ],
        };
        await refreshListener.handle ({ subjectType: "User", causerId: userId, });

        const refresh = captured.find ((item) => item.event === "v1.admin.refresh");

        expect (refresh?.room).toBe ("user:other-user");
        expect (refresh?.payload).toEqual ({ userId: "other-user", scopes: [ "users", ], });

        captured.length = 0;

        const activatedListener = app.get (UserAdminActivatedBroadcastListener);
        const moment = new Date (Date.UTC (2026, 0, 2, 3, 4, 5));

        await activatedListener.handle ({
            id: "account-1",
            name: "Ada",
            email: "ada@test.com",
            password: "secret",
            email_verified_at: moment,
            created_at: moment,
            updated_at: moment,
            deleted_at: null,
        } as never);

        const activated = captured.find ((item) => item.event === "v1.user.admin.activated");

        expect (activated?.room).toBe ("user:account-1");
        expect (activated?.payload.password).toBeUndefined ();
        expect (activated?.payload.email_verified_at).toBe ("2026-01-02 03:04:05");
        expect (Object.keys (activated?.payload || {}).sort ()).toEqual ([
            "created_at", "deleted_at", "email", "email_verified_at", "id", "name", "updated_at",
        ]);

        const login = await request (app.getHttpServer ())
        .post ("/v1/auth/login")
        .send ({
            identifierKey: "email",
            identifierValue: "user@mail.com",
            password: "12345678",
            remember: true,
        })
        .expect (201);
        const loginKeys = Object.keys (login.body).sort ();

        expect (loginKeys).toEqual ([ "accessToken", "accessTokenTtl", "refreshToken", "refreshTokenTtl", ]);

        const listing = await request (app.getHttpServer ())
        .get ("/v1/admin/users")
        .set ("Authorization", `Bearer ${token}`)
        .expect (200);
        const pageKeys = Object.keys (listing.body).sort ();

        expect (pageKeys).toEqual ([
            "currentPage", "data", "firstPage", "lastPage", "nextPage", "perPage", "previousPage", "total", "totalPage",
        ]);

        captured.length = 0;
        const roleName = `transfer-role-${userId.slice (-4).toLowerCase ()}`;
        const roleResponse = await request (app.getHttpServer ())
        .post ("/v1/admin/roles/import")
        .set ("Authorization", `Bearer ${token}`)
        .attach ("file", Buffer.from (`name,guard_name,permissions\n${roleName},web,user.view\n`), "roles.csv")
        .expect (200);

        expect (roleResponse.body).toBe ("Import started");

        const roleImported = await waitFor ("v1.acl.role.admin.imported");

        expect (Object.keys (roleImported.payload).sort ()).toEqual ([ "filename", "totalImported", "totalSkipped", "userId", ].sort ());
        expect (roleImported.room).toBe (`user:${userId}`);

        captured.length = 0;
        const roleExport = await request (app.getHttpServer ())
        .post ("/v1/admin/roles/export")
        .query ({ export_type: "csv", })
        .set ("Authorization", `Bearer ${token}`)
        .expect (200);

        expect (roleExport.body).toBe ("Export started");

        const roleExported = await waitFor ("v1.acl.role.admin.exported");

        expect (Object.keys (roleExported.payload).sort ()).toEqual ([ "fileUrl", "filename", "userId", ]);
        expect (String (roleExported.payload.filename).startsWith ("roles_export_")).toBe (true);

        const roleHeader = readFileSync (join (configService.get<string> ("storage.disks.public.path"), "export", String (roleExported.payload.filename)), "utf8").split ("\n") [0];

        expect (roleHeader).toBe ("name,guard_name,permissions");

        captured.length = 0;
        const permissionName = `transfer.permission.${userId.slice (-4).toLowerCase ()}`;
        const permissionResponse = await request (app.getHttpServer ())
        .post ("/v1/admin/permissions/import")
        .set ("Authorization", `Bearer ${token}`)
        .attach ("file", Buffer.from (`name,guard_name\n${permissionName},web\n`), "permissions.csv")
        .expect (200);

        expect (permissionResponse.body).toBe ("Import started");

        const permissionImported = await waitFor ("v1.acl.permission.admin.imported");

        expect (Object.keys (permissionImported.payload).sort ()).toEqual ([ "filename", "totalImported", "totalSkipped", "userId", ].sort ());

        captured.length = 0;
        const permissionExport = await request (app.getHttpServer ())
        .post ("/v1/admin/permissions/export")
        .query ({ export_type: "csv", })
        .set ("Authorization", `Bearer ${token}`)
        .expect (200);

        expect (permissionExport.body).toBe ("Export started");

        const permissionExported = await waitFor ("v1.acl.permission.admin.exported");

        expect (Object.keys (permissionExported.payload).sort ()).toEqual ([ "fileUrl", "filename", "userId", ]);

        const permissionHeader = readFileSync (join (configService.get<string> ("storage.disks.public.path"), "export", String (permissionExported.payload.filename)), "utf8").split ("\n") [0];

        expect (permissionHeader).toBe ("name,guard_name");

        writeFileSync ("/tmp/codebase-transfer-nest.json", JSON.stringify ({
            importMessage: "Import started",
            exportMessage: "Export started",
            importKeys: [ "filename", "totalImported", "totalSkipped", "userId", ].sort (),
            exportKeys: [ "fileUrl", "filename", "userId", ].sort (),
            refresh: { userId: "other-user", scopes: [ "users", ], room: "user:other-user", },
            notificationKeys: [ "id", "unread", ],
            csvHeader: header,
            sample: { role, status, },
            activatedAt: activated?.payload.email_verified_at,
            filenamePattern: "users_export_YYYYMMDD_HHMMSS.csv",
            loginKeys,
            pageKeys,
            roleCsvHeader: roleHeader,
            permissionCsvHeader: permissionHeader,
            aclSockets: [
                "v1.acl.permission.admin.exported",
                "v1.acl.permission.admin.imported",
                "v1.acl.role.admin.exported",
                "v1.acl.role.admin.imported",
            ],
        }, null, 2));
    });
});
