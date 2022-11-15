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
        expect(article).toEqual({
          article_id: 1,
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
        });
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

describe("GET /api/articles/:article_id/comments", () => {
  test("200: returns an array of comments relating to an article to the client ", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
          });
        });
      });
  });
  test("200: sends an array of comments ordered by descending date order", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: returns an empty array when article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
  test("400: returns an error message when passed an invalid id", () => {
    return request(app)
      .get("/api/articles/banana/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: returns an error message when passed a valid but non-existent article id", () => {
    return request(app)
      .get("/api/articles/500/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: inserts a new comment and returns the inserted comment to the client ", () => {
    const newComment = { username: "butter_bridge", body: "cool stuff" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual({
          comment_id: 19,
          article_id: 1,
          votes: 0,
          created_at: expect.any(String),
          author: "butter_bridge",
          body: "cool stuff",
        });
      });
  });
  test("400: returns an error message when passed an invalid id", () => {
    const newComment = { username: "butter_bridge", body: "cool stuff" };
    return request(app)
      .post("/api/articles/banana/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: returns an error message when passed a valid but non-existent article id", () => {
    const newComment = { username: "butter_bridge", body: "cool stuff" };
    return request(app)
      .post("/api/articles/500/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
  test("400: returns an error message when passed an invalid body with missing required field", () => {
    const newComment = { body: "cool stuff" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns an error message when passed an invalid body with user that doesn't exist", () => {
    const newComment = { username: "coolcat", body: "cool stuff" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});
