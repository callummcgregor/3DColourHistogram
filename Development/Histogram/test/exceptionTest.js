QUnit.module("Exception Tests");

QUnit.test("Test Exception has correct error message", function(assert) {
    var newException = new Exception("Exception message");
    assert.equal(newException.toString(), "Exception message");
});

QUnit.test("Test Exception can be thrown", function(assert) {
    assert.throws(
        function() {
            throw new Exception();
        },
        new Exception()
    )
});