# loopback-seeder

Expressive fixtures generator for Loopback

[![build status](https://secure.travis-ci.org/taoyuan/loopback-seeder.svg)](http://travis-ci.org/taoyuan/loopback-seeder)
[![dependency status](https://david-dm.org/taoyuan/loopback-seeder.svg)](https://david-dm.org/taoyuan/loopback-seeder)

## Installation

### Basic usage

``` bash
npm install --save loopback-seeder
```

``` bash
yarn add loopback-seeder
```

Then, in your `server/component-config.json`, add :

``` json
{
  "loopback-seeder": {
    "dir": "server/seeds",
    "migrate": false,
    "autoLoad": false
  }
}
```

Write your YML fixture file `server/seeds/data.yml` (relative to process.cwd() and adapt according your model) :


``` yaml
Group:
  group{1..10}:
    name: "Groupe {@} depuis les fixtures"

User:
  user{1..10}:
    name: "User {@} : {{name.lastName}}"
    groupId: @group{@}
    email: "{{internet.email}}"
    birthDate: "2016-01-01"
    favoriteNumber: "(function() { return Math.round(Math.random()*1000);})()"
```

### How to load fixtures ?

 - If `autoLoad` is set to `true`, fixtures will be loaded when you start your application

 - With the server:

    `app.seed()` (return a promise)

    e.g:

    ``` js
    app.seed()
      .then(function() {
        console.log('Done!');
      })
      .catch(function(err) {
        console.log('Errors:', err);
      });
    ```

### Configuration options

 - `dir` (default value `'server/seeds'` relative to process.cwd(), or provide a absolute path)

    The directory to seed from

 - `migrate` (default value `false`)

    If set to `false`, data fixtures will be append instead of deleting all data from the database first.
    **WARNING** `true` will erase your database

 - `autoLoad` (default value `false`)


### Features

 - Load data according your model

 - Multiple generators :

    ``` yaml
    User:
      user{1..45}:
        name: "User number {@}"
    ```

    `{@}` represents the current identifier for the generator

 - References :

     ``` yaml
     Group:
       group{1..3}:
         name: "Groupe number {@}"

     User:
       user{1..9}:
         name: "User number {@}"
         group: @group1  # Reference to group1

       user{10..19}:
         name: "User number {@}"
         group: @group.* # Reference to any matching group
     ```

     `@group1` represents the reference for the group1 and can be used in other fixtures
     `@group.*` represents the reference for a **random** matching group

 - Fakers :

    ``` yaml
    User:
      user{1..10}:
        name: "User n°{@} : {{name.lastName}} {{name.firstName}}"
        email: "{{internet.email}}"
    ```

    You can use [Faker.js](https://github.com/marak/faker.js) API to provide fake data

 - Custom function :

    ``` yaml
    User:
      user{1..10}:
        favoriteNumber: "(function() { return Math.round(Math.random()*1000);})()"
    ```

    You can use custom functions too



## Credits
[Yuan Tao](https://github.com/taoyuan)
[Samy Ghribi](https://github.com/sghribi)

## License

ISC
