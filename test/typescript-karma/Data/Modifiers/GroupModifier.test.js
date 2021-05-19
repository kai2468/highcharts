import DataTable from '/base/js/Data/DataTable.js';
import GroupModifier from '/base/js/Data/Modifiers/GroupModifier.js';

QUnit.test('GroupModifier.modify', function (assert) {

    const modifier = new GroupModifier({
            groupColumn: 'y'
        }),
        table = new DataTable({
            x: [ 0, 0, 1, 1 ],
            y: [ 'a', 'b', 'b', 'a']
        });

    modifier.modify(table);

    assert.ok(
        table.getCell('table', 0) instanceof DataTable,
        'Modified table should contain subtables.'
    );

    assert.deepEqual(
        table.getCell('table', 0).getColumns(['x', 'y']),
        {
            x: [0, 1],
            y: ['a', 'a']
        },
        'Modified table should have subtables. (#1)'
    );

    assert.deepEqual(
        table.getCell('table', 1).getColumns(['x', 'y']),
        {
            x: [0, 1],
            y: ['b', 'b']
        },
        'Modified table should have subtables. (#1)'
    );

});

QUnit.test('GroupModifier.modifyCell', function (assert) {
    const modifier = new GroupModifier({
            groupColumn: 'y'
        }),
        table = new DataTable({
            x: [ 0, 0, 1, 1 ],
            y: [ 'a', 'b', 'b', 'a']
        });

    table.setModifier(modifier);

    assert.ok(
        table.modified.getCell('table', 0) instanceof DataTable,
        'Modified table should contain subtables.'
    );

    assert.strictEqual(
        table.modified.getCell('table', 0).getCell('x', 0),
        0,
        'Subtable should contain valid x value.'
    );

    table.setCell('x', 0, 10);

    assert.strictEqual(
        table.modified.getCell('table', 0).getCell('x', 0),
        10,
        'Subtable should contain valid x value.'
    );
});

QUnit.test('GroupModifier.modifyColumns', function (assert) {
    const modifier = new GroupModifier({
            groupColumn: 'y'
        }),
        table = new DataTable({
            x: [ 0, 0, 1, 1 ],
            y: [ 'a', 'b', 'b', 'a']
        });

    table.setModifier(modifier);

    assert.ok(
        table.modified.getCell('table', 0) instanceof DataTable,
        'Modified table should contain subtables.'
    );

    assert.strictEqual(
        table.modified.getCell('table', 0).getCell('x', 0),
        0,
        'Subtable should contain valid x value.'
    );

    table.setColumns({
        'x': [4, 3, 2, 1]
    });

    assert.deepEqual(
        table.modified.getCell('table', 0).getColumn('x'),
        [4, 1],
        'Subtable should contain valid x value.'
    );
});

QUnit.test('GroupModifier.modifyRows', function (assert) {
    const modifier = new GroupModifier({
            groupColumn: 'y'
        }),
        table = new DataTable({
            x: [ 0, 0, 1, 1 ],
            y: [ 'a', 'b', 'b', 'a']
        });

    table.setModifier(modifier);

    assert.ok(
        table.modified.getCell('table', 0) instanceof DataTable,
        'Modified table should contain subtables.'
    );

    assert.strictEqual(
        table.modified.getCell('table', 0).getCell('x', 0),
        0,
        'Subtable should contain valid x value.'
    );

    table.setRows([{ x: 5, y: 'c' }], 1);

    assert.strictEqual(
        table.modified.getCell('table', 1).getCell('x', 0),
        5,
        'Subtable should contain valid x value.'
    );
});
