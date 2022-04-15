# auto-ticket-closer

This is a plugin for https://github.com/discord-tickets/bot

Check out their documentation to get started.

## Installation

1. Run `npm i auto-ticket-closer --no-save`
2. Add `auto-ticket-closer` to the `plugins` array in your bot's config file (`./user/config.js`):
   ```js
   plugins: [
       'auto-ticket-closer'
   ]
   ``` 
3. Add a new property to your config file:
   ```js
   module.exports = {
       debug: false,
       defaults: {
           // ...
       },
       'auto-ticket-closer': {
           closerUserId: '<USER ID>',
           lifetimeMins: 7200
       },
       locale: 'en-GB',
       // ...
       update_notice: true
   };
   ```