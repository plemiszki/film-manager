DatabaseCleaner.clean_with :truncation

User.create(name: "Peter", email: "peter@filmmovement.com", password: "password", admin: true)

DealTemplate.create(name: "No Expenses Recouped")
DealTemplate.create(name: "Expenses Recouped From Top")
DealTemplate.create(name: "Theatrical Expenses Recouped From Top")
DealTemplate.create(name: "Expenses Recouped From Licensor Share")
DealTemplate.create(name: "GR Percentage")
DealTemplate.create(name: "GR Percentage Theatrical/Non-Theatrical")

Importer.import_licensors
Importer.import_films
