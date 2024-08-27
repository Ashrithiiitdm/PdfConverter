import express from 'express';
import pg from 'pg';
import { hostname } from 'os';
import path from 'path';
import process from 'process';


const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASS
});

db.connect();

