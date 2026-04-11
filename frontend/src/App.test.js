import { API_BASE_URL, AUTH_API, AUTH_API_BASE } from "./config";

test("public API URLs are defined for local dev", () => {
  expect(API_BASE_URL).toMatch(/^https?:\/\//);
  expect(AUTH_API_BASE).toMatch(/^https?:\/\//);
  expect(AUTH_API).toContain("/auth");
});
