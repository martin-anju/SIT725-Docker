const expect = require("chai").expect;
const request = require("request");

describe("Auth Routes", function () {
    const baseUrl = "http://localhost:3002";

    it("should return loggedIn: false when no user is authenticated", function (done) {
        request.get(`${baseUrl}/auth/user`, function (error, response, body) {
            expect(response.statusCode).to.equal(200);
            const json = JSON.parse(body);
            expect(json).to.be.an("object");
            expect(json.loggedIn).to.equal(false);
            done();
        });
    });
});