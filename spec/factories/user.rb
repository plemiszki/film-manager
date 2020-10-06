FactoryBot.define do

  factory :user do
    email { 'peter@filmmovement.com' }
    password { 'password' }
    name { 'Peter Lemiszki' }
    title { 'Software Engineer' }
    email_signature { "Peter Lemiszki\nFILM MOVEMENT\n237 West 35th Street, Suite 303\nNew York, NY 10001\nP: 212.941.7645 x206\nF: 212.941.7812\nFilmmovement.com" }
    admin { true }
    access { 150 }
    booker { false }

    factory :normal_user do
      email { 'maxwell@filmmovement.com' }
      password { 'password' }
      name { 'Maxwell Wolkin' }
      title { 'Booker' }
      email_signature { "Maxwell Wolkin\nFILM MOVEMENT\n237 West 35th Street, Suite 303\nNew York, NY 10001\nP: 212.941.7645 x206\nF: 212.941.7812\nFilmmovement.com" }
      access { 50 }

      factory :booker_user do
        booker { true }
      end

    end

  end

end
