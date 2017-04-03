DatabaseCleaner.clean_with :truncation

User.create(name: "Peter", email: "peter@filmmovement.com", password: "password", admin: true)

DealTemplate.create(name: "No Expenses Recouped")
DealTemplate.create(name: "Expenses Recouped From Top")
DealTemplate.create(name: "Theatrical Expenses Recouped From Top")
DealTemplate.create(name: "Expenses Recouped From Licensor Share")
DealTemplate.create(name: "GR Percentage")
DealTemplate.create(name: "GR Percentage Theatrical/Non-Theatrical")

RevenueStream.create(name: "Theatrical")
RevenueStream.create(name: "Non-Theatrical")
RevenueStream.create(name: "Video")
RevenueStream.create(name: "Commerical Video")
RevenueStream.create(name: "HVED")
RevenueStream.create(name: "VOD")
RevenueStream.create(name: "SVOD")
RevenueStream.create(name: "TVOD")
RevenueStream.create(name: "AVOD")
RevenueStream.create(name: "FVOD")
RevenueStream.create(name: "Other Internet")
RevenueStream.create(name: "Hotels, Ships, Airlines")
RevenueStream.create(name: "Television")
RevenueStream.create(name: "FM Subscription")

Importer.import_licensors
Importer.import_films
