if (typeof exports === 'object') {
	var assert = require('assert');
	var alasql = require('..');
}

describe('Test Alias Quotes - Column aliases with different quote types', function () {
	it('1. Backtick quotes for aliases with spaces', function () {
		var res = alasql('SELECT 1+2+3 AS `Fancy Name`');
		assert.deepEqual(res, [{'Fancy Name': 6}]);
	});

	it('2. Square bracket quotes for aliases with spaces', function () {
		var res = alasql('SELECT 1+2+3 AS [Fancy Name]');
		assert.deepEqual(res, [{'Fancy Name': 6}]);
	});

	it('3. Double quotes for aliases with spaces', function () {
		var res = alasql('SELECT 1+2+3 AS "Fancy Name"');
		assert.deepEqual(res, [{'Fancy Name': 6}]);
	});

	it('4. Single quotes for string values (not identifiers)', function () {
		// Single quotes should still be used for string literals, not identifiers
		var data = [{name: 'Alice'}, {name: 'Bob'}];
		var res = alasql("SELECT name, 'Constant' AS label FROM ?", [data]);
		assert.deepEqual(res, [
			{name: 'Alice', label: 'Constant'},
			{name: 'Bob', label: 'Constant'},
		]);
	});

	it('5. Double quotes for identifiers vs single quotes for strings', function () {
		var data = [
			{col1: 1, col2: 2},
			{col1: 3, col2: 4},
		];
		// Double quotes for identifier, single quotes for string
		var res = alasql('SELECT col1 AS "Column One", \'test\' AS str FROM ?', [data]);
		assert.deepEqual(res, [
			{'Column One': 1, str: 'test'},
			{'Column One': 3, str: 'test'},
		]);
	});

	it('6. Mixed quote types in same query', function () {
		var data = [{a: 1, b: 2, c: 3}];
		var res = alasql(
			'SELECT a AS `Backtick Alias`, b AS [Bracket Alias], c AS "Double Quote Alias" FROM ?',
			[data]
		);
		assert.deepEqual(res, [{'Backtick Alias': 1, 'Bracket Alias': 2, 'Double Quote Alias': 3}]);
	});

	it('7. Double quotes with special characters', function () {
		var data = [{x: 100}];
		var res = alasql('SELECT x AS "Column with . and , and !" FROM ?', [data]);
		assert.deepEqual(res, [{'Column with . and , and !': 100}]);
	});

	it('8. Aliases without AS keyword', function () {
		var res = alasql('SELECT 42 "Alias Name"');
		assert.deepEqual(res, [{'Alias Name': 42}]);
	});

	it('9. Double quotes with escaped double quotes', function () {
		// Test that \" inside double quotes is properly unescaped
		var res = alasql('SELECT 1 AS "Column with \\"quotes\\""');
		assert.deepEqual(res, [{'Column with "quotes"': 1}]);
	});

	it('10. Double quotes with doubled double quotes', function () {
		// Test that "" inside double quotes is properly unescaped (SQL standard)
		var res = alasql('SELECT 1 AS "Column with ""quotes"""');
		assert.deepEqual(res, [{'Column with "quotes"': 1}]);
	});
});
