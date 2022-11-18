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

describe("GET /api", () => {
  test("200: sends an endpoints object to the client describing all endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        for (route in endpoints) {
          expect(endpoints[route]).toEqual(
            expect.objectContaining({
              description: expect.any(String),
            })
          );
        }
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

describe("POST /api/topics", () => {
  test("201: creates a new topic and returns the new topic to the client", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "dogs", description: "pictures of cute pups" })
      .expect(201)
      .then(({ body }) => {
        expect(body.topic).toEqual(
          expect.objectContaining({
            slug: "dogs",
            description: "pictures of cute pups",
          })
        );
      });
  });
  test("400: returns an error if passed a slug that already exists", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "mitch", description: "pictures of cute pups" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource already exists");
      });
  });
  test("400: returns an error if passed an object with missing required property", () => {
    return request(app)
      .post("/api/topics")
      .send({ description: "coding" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
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
  describe("queries - pagination", () => {
    test("200: defaults to returning 10 responses when not passed a limit", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(10);
        });
    });
    test("200: returns a total_count property to the client", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { total_count } = body;
          expect(total_count).toBe(12);
        });
    });
    test("200: returns a total_count property to the client when a filter is applies", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          const { total_count } = body;
          expect(total_count).toBe(0);
        });
    });
    test("200: returns limited number of responses if limit is passed", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(5);
        });
    });
    test("200: returns page of results if passed page", () => {
      return request(app)
        .get("/api/articles?p=2")
        .expect(200)
        .then(({ body }) => {
          // 12 articles in total with default 10 articles, so page 2 should have length 2
          const { articles } = body;
          expect(articles.length).toBe(2);
        });
    });
    test("400: returns an error message when passed an invalid limit ", () => {
      return request(app)
        .get("/api/articles?limit=banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid limit query");
        });
    });
    test("400: returns an error message when passed an invalid page ", () => {
      return request(app)
        .get("/api/articles?p=banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid page query");
        });
    });
  });
  describe("queries - topic", () => {
    test("200: filters by topic when topic is passed in query", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
    test("200: returns an empty array when passed a valid topic with no linked articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toEqual([]);
        });
    });
    test("404: returns an error message when passed a topic that does not exist", () => {
      return request(app)
        .get("/api/articles?topic=bananas")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource not found");
        });
    });
  });
  describe("queries - sort_by", () => {
    test("200: articles are sorted by descending date order by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("200: articles are sorted by specified column when passed in query", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("votes", { descending: true });
        });
    });
    test("400: returns an error message when passed an invalid column to sort_by", () => {
      return request(app)
        .get("/api/articles?sort_by=coolness")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort query");
        });
    });
  });
  describe("queries - order (asc/desc)", () => {
    test("200: articles are sorted by ascending date order when order asc is passed in query", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("created_at");
        });
    });
    test("400: returns an error message when passed an invalid order", () => {
      return request(app)
        .get("/api/articles?order=fun")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid order query");
        });
    });
  });
  describe("query - invalid", () => {
    test("400: returns an error message articles if topic query is misspelled ", () => {
      return request(app)
        .get("/api/articles?topik=cats")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid query");
        });
    });
    test("400: returns an error message articles if order query is misspelled ", () => {
      return request(app)
        .get("/api/articles?ordering=asc")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid query");
        });
    });
    test("400: returns an error message articles if sort_by query is misspelled ", () => {
      return request(app)
        .get("/api/articles?sortby=title")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid query");
        });
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
        expect(article).toEqual(
          expect.objectContaining({
            article_id: 1,
            author: "butter_bridge",
            title: "Living in the shadow of a great man",
            body: "I find this existence challenging",
            topic: "mitch",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
          })
        );
      });
  });
  test("200: returns an article with comment_count to the client", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.comment_count).toBe(11);
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
        expect(body.msg).toBe("Resource not found");
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
        expect(body.msg).toBe("Resource not found");
      });
  });
  describe("queries - pagination", () => {
    test("200: defaults to returning 10 responses when not passed a limit", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(10);
        });
    });
    test("200: returns a total_count property to the client", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { total_count } = body;
          expect(total_count).toBe(11);
        });
    });
    test("200: returns limited number of responses if limit is passed", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(5);
        });
    });
    test("200: returns page of results if passed page", () => {
      return request(app)
        .get("/api/articles/1/comments?p=2")
        .expect(200)
        .then(({ body }) => {
          // 11 comments in total with default 10 comments, so page 2 should have length 1
          const { comments } = body;
          expect(comments.length).toBe(1);
        });
    });
    test("400: returns an error message when passed an invalid limit ", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid limit query");
        });
    });
    test("400: returns an error message when passed an invalid page ", () => {
      return request(app)
        .get("/api/articles/1/comments?p=banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid page query");
        });
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
  test("201: inserts a new comment and returns the inserted comment to the client if an additional property is provided ", () => {
    const newComment = {
      username: "butter_bridge",
      body: "cool stuff",
      otherProperty: "thing",
    };
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
        expect(body.msg).toBe("Resource not found");
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
  test("404: returns an error message when passed an invalid body with user that doesn't exist", () => {
    const newComment = { username: "coolcat", body: "cool stuff" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource does not exist");
      });
  });
  test("400: returns an error message when passed misspelled username property", () => {
    const newComment = { usernam: "butter_bridge", body: "cool stuff" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns an error message when passed misspelled body property", () => {
    const newComment = { username: "butter_bridge", boddy: "cool stuff" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: updates an article by provided votes and returns updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 50 })
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 150,
        });
      });
  });
  test("200: updates an article to subtract votes when passed negative inc_votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -150 })
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: -50,
        });
      });
  });
  test("400: returns an error message when passed an invalid id", () => {
    return request(app)
      .patch("/api/articles/banana")
      .send({ inc_votes: 50 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: returns an error message when passed a valid but non-existent id", () => {
    return request(app)
      .patch("/api/articles/500")
      .send({ inc_votes: 50 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource not found");
      });
  });
  test("400: returns an error message when passed an invalid number of votes (not a number)", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "banana" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns an error message when passed an invalid number of votes (not an integer)", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 5.5 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns an error message when passed an invalid body (misspelled inc_votes)", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc__votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns an error message when passed an invalid body (missing required property inc_votes)", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("201: creates an article and sends the created article to the client", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "New article",
        body: "Something cool",
        topic: "cats",
      })
      .expect(201)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual({
          article_id: 13,
          title: "New article",
          topic: "cats",
          author: "butter_bridge",
          body: "Something cool",
          created_at: expect.any(String),
          votes: 0,
          comment_count: 0,
        });
      });
  });
  test("404: returns an error when passed an author that does not exist", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "frodo",
        title: "there and back again",
        body: "my book",
        topic: "cats",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource does not exist");
      });
  });
  test("404: returns an error when passed a topic that does not exist", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "there and back again",
        body: "my book",
        topic: "hobbits",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource does not exist");
      });
  });
  test("400: returns an error when passed a missing required field", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "there and back again",
        body: "my book",
        topic: "hobbits",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("204: deletes the given article and returns no content to the client", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("400: returns an error message when passed an invalid article id", () => {
    return request(app)
      .delete("/api/articles/bananas")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: returns an error message when passed a valid but nonexistent article id", () => {
    return request(app)
      .delete("/api/articles/500")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: updates a comment by provided votes and returns updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toEqual({
          comment_id: 1,
          article_id: 9,
          author: "butter_bridge",
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          created_at: expect.any(String),
          votes: 17,
        });
      });
  });
  test("400: returns an error when passed an invalid id", () => {
    return request(app)
      .patch("/api/comments/banana")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: returns an error when passed an valid id that does not exist", () => {
    return request(app)
      .patch("/api/comments/500")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource not found");
      });
  });
  test("400: returns an error when passed an invalid number of votes (string)", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "banana" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns an error when passed an invalid number of votes (decimal)", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1.4 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns an error when passed a missing number of votes", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes the given comment and returns no content to the client", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("400: returns an error message when passed an invalid comment id", () => {
    return request(app)
      .delete("/api/comments/bananas")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: returns an error message when passed a valid but nonexistent comment id", () => {
    return request(app)
      .delete("/api/comments/500")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource not found");
      });
  });
});

describe("GET /api/users", () => {
  test("200: sends an array of users to the client", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: sends a user object to the client", () => {
    return request(app)
      .get("/api/users/icellusedkars")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toEqual({
          username: "icellusedkars",
          name: "sam",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
        });
      });
  });
  test("404: returns an error when passed a username that doesn't exist", () => {
    return request(app)
      .get("/api/users/hello")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource not found");
      });
  });
});
