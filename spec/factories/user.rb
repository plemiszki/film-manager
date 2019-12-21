FactoryBot.define do
  factory :user do
    email { 'peter@filmmovement.com' }
    password { 'password' }
    name { 'Peter Lemiszki' }
    title { '' }
    email_signature { "Peter Lemiszki\nFILM MOVEMENT\n237 West 35th Street, Suite 604\nNew York, NY 10001\nP: 212.941.7645 x206\nF: 212.941.7812\nFilmmovement.com" }
    admin { true }
    access { 150 }
    booker { false }
  end
end
