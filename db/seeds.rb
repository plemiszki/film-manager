DatabaseCleaner.clean_with :truncation

User.create(name: "Peter", email: "peter@filmmovement.com", password: "password")
