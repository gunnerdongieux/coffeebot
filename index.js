/*
* Venmo to Notion bot for Surf N Skate: Made by Gunner Dongieux and Dhruv Sumathi
*/

import { Client } from "@notionhq/client";
import fs from 'fs';
import moment from 'moment-timezone';


const notion = new Client({ auth: process.env.NOTION_KEY }); // Notion API setup

const databaseId = process.env.NOTION_DATABASE_ID; // Get the right database id

/*
* This function filters the database with id databaseId so that it's only left with elements that have the same transaction id as idToCheck. This is used to check if 
* there are any entries with the same transaction id already in the database (to avoid duplicates).
*/
async function queryDatabase(idToCheck) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        {
          property: 'Transaction ID',
          number: {
            equals : idToCheck,
          },
        },
      ],
    },
  });
  console.log(response);
  return response;
}

/*
* This function makes a new entry in the notion database with properties name, amount, date, note, and id.
*/
async function addItem({name, amount, date, note, id}) {
  try {
    var matches_length = 0;
    queryDatabase(id).then(async (responseh) => {
      console.log(responseh.results.length);
      matches_length = responseh.results.length;
      if (matches_length == 0) {
        const response = await notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
              title: {
                  title: [
                      {
                          type: 'text',
                          text: {
                              content: name,
                          },
                      },
                  ],
              },
              'Amount Paid': {
                  type: 'number',
                  number: amount,
              },
    
              'Date': {
                  type: 'date',
                  date: {
                    start: moment(date).local().format(),
                  },
              },

              "Note":{
                rich_text:[
                    {
                      type:"text",
                      text:{
                          content: note
                      },
                      annotations:{
                        "italic":false,
                        "bold": false,
                        "underline": false,
                        "strikethrough": false,
                        "color": "orange"
                     }
                    },
                ]
          },

              'Transaction ID': {
                type: 'number',
                number: id,
            },
  
          },
        });
      }
    });
    
    console.log("Success! Entry added.");
  } catch (error) {
    console.error(error.body);
  }
}

const venmo_json = fs.readFileSync('./venmo_transactions_today.json');

JSON.parse(venmo_json).map(addItem); // Adds a notion database entry for every single row in the json
console.log();