DatabaseCleaner.clean_with :truncation

User.create(name: "Peter", email: "peter@filmmovement.com", password: "password", admin: true)

DealTemplate.create(name: "No Expenses Recouped")
DealTemplate.create(name: "Expenses Recouped From Top")
DealTemplate.create(name: "Theatrical Expenses Recouped From Top")
DealTemplate.create(name: "Expenses Recouped From Licensor Share")
DealTemplate.create(name: "GR Percentage")
DealTemplate.create(name: "GR Percentage Theatrical/Non-Theatrical")

RevenueStream.create(name: "Theatrical", order: 0)
RevenueStream.create(name: "Non-Theatrical", nickname: "Non-T", order: 1)
RevenueStream.create(name: "Video", order: 2)
RevenueStream.create(name: "Commercial Video", nickname: "C. Video", order: 3)
RevenueStream.create(name: "VOD", order: 4)
RevenueStream.create(name: "SVOD", order: 5)
RevenueStream.create(name: "TVOD", order: 6)
RevenueStream.create(name: "AVOD", order: 7)
RevenueStream.create(name: "FVOD", order: 8)
RevenueStream.create(name: "Other Internet", nickname: "Internet", order: 9)
RevenueStream.create(name: "Hotels, Ships, Airlines", nickname: "Ancillary", order: 10)
RevenueStream.create(name: "Television", nickname: "TV", order: 11)
RevenueStream.create(name: "FM Subscription", nickname: "Club", order: 12)
RevenueStream.create(name: "Jewish Festivals", nickname: "Jewish", order: 13)

Importer.import_licensors
Importer.import_films
