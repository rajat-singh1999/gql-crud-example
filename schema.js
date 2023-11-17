export const typeDefs = `#graphql
    type Game {
        id: ID!
        title: String!
        platform: [String!]!
        reviews: [Review!]
    }

    type Review {
        id: ID!
        rating: Int!
        content: String!
        game: Game!
        author: Author!
    }

    type Author {
        id: ID!
        name: String!
        verified: Boolean!
        reviews: [Review!]
    }

    type Query {
        reviews: [Review]
        review(id: ID!): Review
        games: [Game]
        game(id: ID!): Game
        authors: [Author]
        author(id: ID!): Author
    }

    type Mutation {
        addGame(game: AddGameInput!): Game
        updateGame(id: ID!, edits: EditGameInput!): Game
        deleteGame(id: ID!): [Game]
        
        addReview(review: AddReviewInput!, others: OthersReview!): Review
        deleteReview(id: ID!): [Review]

        addAuthor(author: AddAuthorInput!): Author
        updateAuthor(id: ID!, edits: EditAuthorInput!): Author
        deleteAuthor(id: ID!): [Author]
    }

    input OthersReview {
        game_id: ID!, author_id: ID!
    }

    input AddGameInput {
        title: String!
        platform: [String!]!
    }

    input EditGameInput {
        title: String
        platform: [String!]
    }

    input AddReviewInput {
        rating: Int!
        content: String!
    }

    input AddAuthorInput {
        name: String!
        verified: Boolean!
    }

    input EditAuthorInput {
        name: String
        verified: Boolean
    }
`
