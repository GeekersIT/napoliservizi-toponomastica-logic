import KcAdminClient from '@keycloak/keycloak-admin-client';

import config from './config.js';
import database from './database.js';

import express from 'express';
// const express = require("express");
const app = express();
const port = 3000;

// import { SimpleDateFormat } from '@riversun/simple-date-format';
// const SimpleDateFormat = require("@riversun/simple-date-format");
// const sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

import { gql } from 'graphql-request';
// const { gql } = require("graphql-request");

const kcAdminClient = new KcAdminClient.default({
  baseUrl: config.keycloak.url,
  realmName: config.keycloak.realm,
});

// const config = require("./config");
// const database = require("./database");

import bodyParser from 'body-parser';
// var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post("/municipalita/aggiungi", async (req, res) => {
  try {
    var data = req.body.event.data;
    await kcAdminClient.auth({
      clientSecret: config.keycloak.secret,
      grantType: 'client_credentials',
      clientId: 'admin-cli'
    });
    await kcAdminClient.groups.setOrCreateChild(
      {id: 'bf6892c6-0ce4-4d65-aabe-8103eb1e9dd7'},
      {
        name: data.new.id, 
        attributes: {
        nome: [data.new.nome],
        gruppo_municipalita: [data.new.id]

      }},
    );
    res.send("OK");
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

app.post("/municipalita/cancella", async (req, res) => {
  try {
    var data = req.body.event.data;
    await kcAdminClient.auth({
      clientSecret: config.keycloak.secret,
      grantType: 'client_credentials',
      clientId: 'admin-cli'
    });
    const groups = await kcAdminClient.groups.findOne({
      id: 'bf6892c6-0ce4-4d65-aabe-8103eb1e9dd7'
    });
    const groupId = groups.subGroups.filter(group => group.name == String(data.old.id))[0].id
    await kcAdminClient.groups.del({
      id: groupId
    });
    res.send("OK");
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

app.get('/_health', (req, res) => {
  res.send({'status': 'ok'}); // Simple health endpoint so kubernetes/other know that service is up and running
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
