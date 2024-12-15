/**
 * @param { import ("knex").Knex } blueprint
 * @returns { Promise<void> }
 */
exports.up = async function (blueprint)
{
    return blueprint.schema.createTable ("users", function (table) {

        table.uuid ("id");
        table.string ("name");
        table.string ("email").notNullable ();
        table.string ("password").notNullable ();
        table.timestamp ("email_verified_at").nullable ();
        table.timestamp ("password_changed_at").nullable ();
        table.timestamp ("created_at").defaultTo (blueprint.fn.now ());
        table.timestamp ("updated_at").defaultTo (blueprint.fn.now ());
        table.timestamp ("deleted_at");

        table.primary ("id");
        table.index ("email");
    });
}

/**
 * @param { import ("knex").Knex } blueprint
 * @returns { Promise<void> }
 */
exports.down = function (blueprint)
{
    return blueprint.schema.dropTableIfExists ("users");
}
