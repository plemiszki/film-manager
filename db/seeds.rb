DatabaseCleaner.clean_with :truncation

User.create(name: "Peter", email: "peter@filmmovement.com", password: "password", admin: true)

Importer.import_licensors
Importer.import_films
