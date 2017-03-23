DatabaseCleaner.clean_with :truncation

User.create(name: "Peter", email: "peter@filmmovement.com", password: "password")

Importer.import_licensors
Importer.import_films
