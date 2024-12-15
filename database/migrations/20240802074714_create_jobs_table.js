/**
 * @param { import ("knex").Knex } blueprint
 * @returns { Promise<void> }
 */
exports.up = async function (blueprint)
{
    return blueprint.schema.createTable ("jobs", function (table) {

        table.string ("id", 26);
        table.string ("queue");
        table.jsonb ("payload");
        table.bigint ("scheduled_at").defaultTo (0);
        table.timestamp ("created_at").defaultTo (blueprint.fn.now ());
        table.timestamp ("updated_at").defaultTo (blueprint.fn.now ());

        table.primary ("id");
        table.index ("id");
        table.index ("queue");
        table.index ([ "queue", "scheduled_at", ]);
    });
}

/**
 * @param { import ("knex").Knex } blueprint
 * @returns { Promise<void> }
 */
exports.down = function (blueprint)
{
    return blueprint.schema.dropTableIfExists ("jobs");
}
