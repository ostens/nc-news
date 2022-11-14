const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

const request = require("supertest");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /api/not-a-route", () => {
  test("404: returns URL not found message", () => {
    return request(app)
      .get("/api/not-a-route")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("URL not found");
      });
  });
});

describe("GET /api/topics", () => {
  test("200: sends an array of topics to the client", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(Object.keys(topic)).toEqual(
            expect.arrayContaining(["slug", "description"])
          );
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200: sends an array of articles to the client", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(Object.keys(article)).toEqual(
            expect.arrayContaining([
              "article_id",
              "author",
              "title",
              "topic",
              "created_at",
              "votes",
              "comment_count",
            ])
          );
        });
      });
  });
  test("200: sends an array of articles ordered by descending date order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: returns an article to the client", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(Object.keys(article)).toEqual(
          expect.arrayContaining([
            "article_id",
            "author",
            "title",
            "body",
            "topic",
            "created_at",
            "votes",
          ])
        );
      });
  });
  test("400: returns an error message when passed an invalid id", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: returns an error message when passed a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/500")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
});
