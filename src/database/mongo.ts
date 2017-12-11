import { MongoClient, Db } from "mongodb";

let db: Db;

export async function connectToDb(): Promise<Db> {
    const connectionUri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}`
        + `@cluster0-shard-00-00-nh12c.mongodb.net:27017,cluster0-shard-00-01-nh12c.mongodb.net:27017`
        + `,cluster0-shard-00-02-nh12c.mongodb.net:27017/sound-track?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`;
    return MongoClient.connect(connectionUri).then(database => {
        db = database;
        return database;
    });
};

export function getDb(): Db {
    if (!db) {
        throw "There is no connection to database";
    }
    return db;
}