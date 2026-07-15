const authorize = require("../../src/middleware/authorize");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("middleware/authorize", () => {
  test("calls next() when the user's role is in the allow-list", () => {
    const req = { user: { role: "ADMIN" } };
    const res = mockRes();
    const next = jest.fn();

    authorize("ADMIN", "MANAGER")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("responds 403 when the user's role is not in the allow-list", () => {
    const req = { user: { role: "REP" } };
    const res = mockRes();
    const next = jest.fn();

    authorize("ADMIN", "MANAGER")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("responds 401 when req.user is missing (authenticate not run first)", () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    authorize("ADMIN")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("allows any of multiple permitted roles", () => {
    const res1 = mockRes();
    const next1 = jest.fn();
    authorize("ADMIN", "MANAGER", "REP")(
      { user: { role: "REP" } },
      res1,
      next1
    );
    expect(next1).toHaveBeenCalledTimes(1);
  });
});
