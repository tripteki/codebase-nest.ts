/**
 * @class {AclAdminImportedEvent}
 */
export class AclAdminImportedEvent
{
    /**
     * @param {Partial<AclAdminImportedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<AclAdminImportedEvent>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    userId: string;

    /**
     * @type {string}
     */
    filename: string;

    /**
     * @type {number}
     */
    totalImported: number;

    /**
     * @type {number}
     */
    totalSkipped: number;

    /**
     * @type {"role" | "permission"}
     */
    subject: "role" | "permission";
}

/**
 * @class {AclAdminImportedFailedEvent}
 */
export class AclAdminImportedFailedEvent
{
    /**
     * @param {Partial<AclAdminImportedFailedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<AclAdminImportedFailedEvent>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    userId: string;

    /**
     * @type {string}
     */
    filename: string;

    /**
     * @type {string}
     */
    error: string;

    /**
     * @type {"role" | "permission"}
     */
    subject: "role" | "permission";
}

/**
 * @class {AclAdminExportedEvent}
 */
export class AclAdminExportedEvent
{
    /**
     * @param {Partial<AclAdminExportedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<AclAdminExportedEvent>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    userId: string;

    /**
     * @type {string}
     */
    filename: string;

    /**
     * @type {string}
     */
    fileUrl: string;

    /**
     * @type {string}
     */
    filePath: string;

    /**
     * @type {"role" | "permission"}
     */
    subject: "role" | "permission";
}

/**
 * @class {AclAdminExportedFailedEvent}
 */
export class AclAdminExportedFailedEvent
{
    /**
     * @param {Partial<AclAdminExportedFailedEvent>} partial
     * @returns {void}
     */
    constructor (partial: Partial<AclAdminExportedFailedEvent>)
    {
        Object.assign (this, partial);
    }

    /**
     * @type {string}
     */
    userId: string;

    /**
     * @type {string}
     */
    error: string;

    /**
     * @type {"role" | "permission"}
     */
    subject: "role" | "permission";
}
