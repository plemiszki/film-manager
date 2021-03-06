class Importer < ActiveRecord::Base

  @@vb_film_ids = {}

  def self.import_bookings(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/Bookings.txt")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/Bookings.txt"))
    billings_skipped = 0
    shippings_skipped = 0
    File.open(Rails.root.join("tmp/#{time_started}/Bookings.txt")) do |f|
      first_line = f.gets
      total = first_line.gsub("\n", "").gsub("\r", "").to_i
      bookings = 0
      until bookings == total
        a = f.gets.gsub("\n", "").gsub("\r", "").split("\t")
        if a[2] == "291"
          bookings += 1
          next
        end

        venue = Venue.where('ltrim(rtrim(lower(label))) = ?', a[3].downcase.strip.gsub('jff', 'jewish film festival')).first
        unless venue
          venue = Venue.where('ltrim(rtrim(lower(label))) = ?', a[3].downcase.strip.gsub('ff', 'film festival')).first
        end
        unless venue
          venue = Venue.where('ltrim(rtrim(lower(label))) = ?', a[3].downcase.strip.gsub("int'l", 'international')).first
        end
        unless venue
          venue = Venue.where('ltrim(rtrim(lower(label))) = ?', a[3].downcase.strip.gsub('ff', 'film festival').gsub("int'l", 'international')).first
        end
        if a[3] == "McDaniel College - Dept. of World Lang."
          venue = Venue.where(label: "McDaniel College").first
        end
        if a[3] == "Virgina Tech  - Foreign Lang. and Lit."
          venue = Venue.where(label: "Virginia Tech").first
        end
        if a[3] == "CINÉMA-OKTÁ"
          venue = Venue.find(1674)
        end
        if a[3] == "Palm Beach Country Library System"
          venue = Venue.find(1573)
        end
        unless venue
          bookings += 1
          next
        end

        format = a[21].strip
        format = 'DVD' if format.empty?
        format = format.sub('Prolduio', 'Proludio').sub('Blu-Ray', 'Blu-ray').sub('HDCam', 'HDCAM').sub('HD Cam', 'HDCAM').sub('CineConducotr', 'CineConductor').sub('CineCondcutor', 'CineConductor').sub('Cinecondcutor', 'CineConductor').sub('Cineconductor', 'CineConductor').sub('0', '').sub('Digital file', 'Digital').sub('DigiFile', 'Digital').sub('Digifile', 'Digital').sub('AVI/MP$', 'Digital')

        format_record = Format.find_by_name(format)
        if format_record
          format_id = format_record.id
        else
          format_id = Format.create(name: format).id
        end

        bookers = {
          "JW": 9,
          "MW": 8,
          "Gathr": 8,
          "CT": 10,
          "producer": 11,
          "N/A": 11,
          "NA": 11,
          "jw": 9
        }

        past_bookers = {
          "RC": 1,
          "MJ": 2,
          "RL": 3
        }

        if a[20].empty?
          old_user_id = past_bookers[a[19].to_sym]
        else
          old_user_id = past_bookers[a[20].to_sym]
        end
        if a[19].empty?
          old_booker_id = past_bookers[a[20].to_sym]
        else
          old_booker_id = past_bookers[a[19].to_sym]
        end

        unless old_booker_id
          if a[19].empty?
            booker_id = bookers[a[20].to_sym]
            unless booker_id
              raise "didn't find #{a[20]}"
            end
          else
            booker_id = bookers[a[19].to_sym]
            unless booker_id
              raise "didn't find #{a[19]}"
            end
          end
        end
        unless old_user_id
          if a[20].empty?
            user_id = bookers[a[19].to_sym]
            unless user_id
              raise "didn't find #{a[19]}"
            end
          else
            user_id = bookers[a[20].to_sym]
            unless user_id
              raise "didn't find #{a[20]}"
            end
          end
        end

        phone_regex = Regexp.new('\A[\)\(\d\.\s-]+\z')
        email_regex = Regexp.new('\A\w+@\w+\.[a-zA-Z]+\z')
        last_line_regex = Regexp.new('(?<city>[a-zA-Z\s]+)\s?,? (?<state>[a-zA-Z][a-zA-Z]),? (?<zip>\d+)')
        last_line_regex_canada = Regexp.new('(?<city>[a-zA-Z\s]+)\s?,? (?<province>[a-zA-Z][a-zA-Z]) (?<zip>[\w\d\s]+)')
        city_state_regex = Regexp.new('\A(?<city>[a-zA-Z\s]+)\s?,? (?<state>[a-zA-Z][a-zA-Z])\z')

        skip_billing = false
        billing_address_string = a[17]
        if billing_address_string.strip.empty?
          billing_name = ""
          billing_address1 = ""
          billing_address2 = ""
          billing_city = ""
          billing_state = ""
          billing_zip = ""
          billing_country = ""
        else
          billing_address_lines = billing_address_string.split('\n')
          2.times do
            if billing_address_lines[-1].strip == "=" || billing_address_lines[-1].strip.downcase == "usa" || billing_address_lines[-1].strip.downcase == "canada" || phone_regex.match(billing_address_lines[-1].strip) || email_regex.match(billing_address_lines[-1].strip)
              billing_address_lines.pop
            end
          end
          if billing_address_lines.length > 4
            p "Skipping Booking Address: #{Film.find(@@vb_film_ids[a[2]]).title} - #{venue.label}"
            p billing_address_lines
            skip_billing = true
            billings_skipped += 1
          else
            last_line = billing_address_lines[-1].strip
            match_data = last_line_regex.match(last_line)
            if !match_data
              match_data = last_line_regex_canada.match(last_line)
              if !match_data
                match_data = city_state_regex.match(last_line)
                if !match_data
                  if billing_address_lines.length > 1
                    p "Skipping Booking Address: #{Film.find(@@vb_film_ids[a[2]]).title} - #{venue.label}"
                    p billing_address_lines
                  end
                  skip_billing = true
                  billings_skipped += 1
                else
                  billing_name = billing_address_lines[0]
                  billing_address1 = billing_address_lines[1]
                  billing_address2 = billing_address_lines.length == 4 ? billing_address_lines[2] : ""
                  billing_city = match_data[:city]
                  billing_state = match_data[:state]
                  billing_zip = ""
                  billing_country = "USA"
                end
              else
                billing_name = billing_address_lines[0]
                billing_address1 = billing_address_lines[1]
                billing_address2 = billing_address_lines.length == 4 ? billing_address_lines[2] : ""
                billing_city = match_data[:city]
                billing_state = match_data[:province]
                billing_zip = match_data[:zip]
                billing_country = "Canada"
              end
            else
              billing_name = billing_address_lines[0]
              billing_address1 = billing_address_lines[1]
              billing_address2 = billing_address_lines.length == 4 ? billing_address_lines[2] : ""
              billing_city = match_data[:city]
              billing_state = match_data[:state]
              billing_zip = match_data[:zip]
              billing_country = "USA"
            end
          end
        end

        skip_shipping = false
        shipping_address_string = a[16]
        if shipping_address_string.strip.empty?
          shipping_name = ""
          shipping_address1 = ""
          shipping_address2 = ""
          shipping_city = ""
          shipping_state = ""
          shipping_zip = ""
          shipping_country = ""
        else
          shipping_address_lines = shipping_address_string.split('\n')
          2.times do
            if shipping_address_lines[-1].strip == "=" || shipping_address_lines[-1].strip.downcase == "usa" || shipping_address_lines[-1].strip.downcase == "canada" || phone_regex.match(shipping_address_lines[-1].strip) || email_regex.match(shipping_address_lines[-1].strip)
              shipping_address_lines.pop
            end
          end
          if shipping_address_lines.length > 4
            p "Skipping Shipping Address: #{Film.find(@@vb_film_ids[a[2]]).title} - #{venue.label}"
            p shipping_address_lines
            skip_shipping = true
            shippings_skipped += 1
          else
            last_line = shipping_address_lines[-1].strip
            match_data = last_line_regex.match(last_line)
            if !match_data
              match_data = last_line_regex_canada.match(last_line)
              if !match_data
                match_data = city_state_regex.match(last_line)
                if !match_data
                  if shipping_address_lines.length > 1
                    p "Skipping Shipping Address: #{Film.find(@@vb_film_ids[a[2]]).title} - #{venue.label}"
                    p shipping_address_lines
                  end
                  skip_shipping = true
                  shippings_skipped += 1
                else
                  shipping_name = shipping_address_lines[0]
                  shipping_address1 = shipping_address_lines[1]
                  shipping_address2 = shipping_address_lines.length == 4 ? shipping_address_lines[2] : ""
                  shipping_city = match_data[:city]
                  shipping_state = match_data[:state]
                  shipping_zip = ""
                  shipping_country = "USA"
                end
              else
                shipping_name = shipping_address_lines[0]
                shipping_address1 = shipping_address_lines[1]
                shipping_address2 = shipping_address_lines.length == 4 ? shipping_address_lines[2] : ""
                shipping_city = match_data[:city]
                shipping_state = match_data[:province]
                shipping_zip = match_data[:zip]
                shipping_country = "Canada"
              end
            else
              shipping_name = shipping_address_lines[0]
              shipping_address1 = shipping_address_lines[1]
              shipping_address2 = shipping_address_lines.length == 4 ? shipping_address_lines[2] : ""
              shipping_city = match_data[:city]
              shipping_state = match_data[:state]
              shipping_zip = match_data[:zip]
              shipping_country = "USA"
            end
          end
        end

        if skip_billing
          billing_name = ""
          billing_address1 = ""
          billing_address2 = ""
          billing_city = ""
          billing_state = ""
          billing_zip = ""
          billing_country = ""
        end

        if skip_shipping
          shipping_name = ""
          shipping_address1 = ""
          shipping_address2 = ""
          shipping_city = ""
          shipping_state = ""
          shipping_zip = ""
          shipping_country = ""
        end

        booking_vars = {
          film_id: @@vb_film_ids[a[2]],
          venue_id: venue.id,
          date_added: (a[22] == "12:00:00 AM" ? a[6] : a[22]),
          booking_type: a[5],
          status: (a[26].empty? ? "Confirmed" : a[26]),
          start_date: a[6],
          end_date: a[7],
          terms: a[8],
          terms_change: a[9] == "True",
          advance: a[14],
          shipping_fee: a[15],
          screenings: a[18],
          email: a[30],
          imported_advance_invoice_number: a[25],
          imported_advance_invoice_sent: (a[23] == "12:00:00 AM" ? "" : a[23]),
          booking_confirmation_sent: (a[24] == "12:00:00 AM" ? "" : a[24]),
          imported_overage_invoice_number: a[55],
          imported_overage_invoice_sent: (a[54] == "12:00:00 AM" ? "" : a[54]),
          premiere: a[27],
          materials_sent: (a[33] == "12:00:00 AM" ? "" : a[33]),
          no_materials: a[37] == "True",
          shipping_notes: a[36],
          tracking_number: a[34],
          delivered: (a[35] == "True"),
          house_expense: a[51],
          notes: a[52],
          deduction: a[53],
          box_office: a[45],
          box_office_received: a[43] == 'True',
          booker_id: booker_id,
          old_booker_id: old_booker_id,
          user_id: user_id,
          old_user_id: old_user_id,
          billing_name: billing_name,
          billing_address1: billing_address1,
          billing_address2: billing_address2,
          billing_city: billing_city,
          billing_state: billing_state,
          billing_zip: billing_zip,
          billing_country: billing_country,
          shipping_name: shipping_name,
          shipping_address1: shipping_address1,
          shipping_address2: shipping_address2,
          shipping_city: shipping_city,
          shipping_state: shipping_state,
          shipping_zip: shipping_zip,
          shipping_country: shipping_country,
          format_id: format_id
        }

        booking = Booking.find_by(film_id: booking_vars[:film_id], venue_id: booking_vars[:venue_id], start_date: Date.strptime(booking_vars[:start_date], "%m/%d/%Y"))
        if booking
          booking.update(booking_vars)
        else
          p "Adding Booking: #{venue.label}"
          booking = Booking.new(booking_vars)
        end
        booking.save!

        # weekly terms
        if booking.attributes["terms_change"]
          unless a[10].strip.empty?
            unless WeeklyTerm.find_by({ booking_id: booking.id, order: 0, terms: a[10].strip })
              WeeklyTerm.create!(booking_id: booking.id, terms: a[10].strip, order: 0)
            end
          end
          unless a[11].strip.empty?
            unless WeeklyTerm.find_by({ booking_id: booking.id, order: 1, terms: a[11].strip })
              WeeklyTerm.create!(booking_id: booking.id, terms: a[11].strip, order: 1)
            end
          end
          unless a[12].strip.empty?
            unless WeeklyTerm.find_by({ booking_id: booking.id, order: 2, terms: a[12].strip })
              WeeklyTerm.create!(booking_id: booking.id, terms: a[12].strip, order: 2)
            end
          end
          unless a[13].strip.empty?
            unless WeeklyTerm.find_by({ booking_id: booking.id, order: 3, terms: a[13].strip })
              WeeklyTerm.create!(booking_id: booking.id, terms: a[13].strip, order: 3)
            end
          end
        end

        # weekly box office
        if booking.attributes["terms_change"]
          unless a[47] == "0"
            unless WeeklyBoxOffice.find_by({ booking_id: booking.id, order: 0, amount: a[47].strip })
              WeeklyBoxOffice.create!(booking_id: booking.id, amount: a[47].strip, order: 0)
            end
          end
          unless a[48] == "0"
            unless WeeklyBoxOffice.find_by({ booking_id: booking.id, order: 1, amount: a[48].strip })
              WeeklyBoxOffice.create!(booking_id: booking.id, amount: a[48].strip, order: 1)
            end
          end
          unless a[49] == "0"
            unless WeeklyBoxOffice.find_by({ booking_id: booking.id, order: 2, amount: a[49].strip })
              WeeklyBoxOffice.create!(booking_id: booking.id, amount: a[49].strip, order: 2)
            end
          end
          unless a[50] == "0"
            unless WeeklyBoxOffice.find_by({ booking_id: booking.id, order: 3, amount: a[50].strip })
              WeeklyBoxOffice.create!(booking_id: booking.id, amount: a[50].strip, order: 3)
            end
          end
        end

        # payments
        if a[38] == "True"
          date = (a[39] == "12:00:00 AM" ? booking.start_date : Date.strptime(a[39], "%m/%d/%Y"))
          unless Payment.find_by({ booking_id: booking.id, date: date })
            p "Adding Payment: #{a[39]} #{a[40]}"
            Payment.create!(booking_id: booking.id, amount: a[40], date: date, notes: "")
          end
        end
        if a[60] == "True"
          date = (a[61] == "12:00:00 AM" ? booking.end_date : Date.strptime(a[61], "%m/%d/%Y"))
          unless Payment.find_by({ booking_id: booking.id, date: date })
            p "Adding Payment: #{a[61]} #{a[62]}"
            Payment.create!(booking_id: booking.id, amount: a[62], date: date, notes: "")
          end
        end

        bookings += 1
      end
      object.delete
    end
    p "Billings Skipped: #{billings_skipped}"
    p "Shippings Skipped: #{shippings_skipped}"
  end

  def self.import_admin(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/Admin.txt")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/Admin.txt"))
    File.open(Rails.root.join("tmp/#{time_started}/Admin.txt")) do |f|
      array = f.gets.split('^')

      # licensors
      total = array[0].to_i
      array.shift
      licensors = 0
      until licensors == total
        licensor = Licensor.find_by_name(array[1])
        if licensor
          licensor.update(name: array[1], address: "#{array[2]}\n#{array[3]}\n#{array[4]}")
        else
          licensor = Licensor.new(name: array[1], address: "#{array[2]}\n#{array[3]}\n#{array[4]}")
        end
        licensor.save!
        array.shift(5)
        licensors += 1
      end

      # languages
      total = array[0].to_i
      array.shift
      languages = 0
      until languages == total
        array.shift(3)
        languages += 1
      end

      # cast/crew
      total = array[0].to_i
      array.shift
      actors = 0
      until actors == total
        array.shift(3)
        actors += 1
      end
    end
    object.delete
  end

  def self.get_orders(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/Films.txt")
    object.get(response_target: "tmp/#{time_started}/Films.txt")
    File.open(Rails.root.join("tmp/#{time_started}/Films.txt")) do |file|
      titles = []
      total = file.gets.to_i
      films = 0
      mismatched_laurels = 0
      until films == total
        a = file.gets.split("\t")
        if a[1].empty? || a[1][0..8] == "(NEW FILM" || ["Captive Beauty", "The Dark Sea", "The Condemned", "Camino del Vino", "Mundo Secreto", "Sal", "Chance", "Nairobi Half Life", "School's Out", "Something Necessary", "War Witch", "Things From Another World", "Pulce is Not Here", "Climate of Change", "Fire in Babylon", "Booker's Place: A Mississippi Story", "Boys of Summer", "Felony", "Deep Throat Part II Collection", "Quality Time", "Smitten!", "Farewell Herr Schwarz", "Arabian Nights: Volume 1, The Restless One", "Arabian Nights: Volume 2, The Desolate One", "Arabian Nights: Volume 3, The Enchanted One", "A Strange Course of Events", "Fire at Sea", "Marcel Proust's Time Regained", "The American Dreamer"].include?(a[1])
          films += 1
          next
        end

        title = a[1]
        if title == "As If I'm Not There"
          title = "As If I Am Not There"
        elsif title == "Inch' Allah Dimanche"
          title = "Inch'Allah Dimanche"
        end
        titles << title
        film = Film.find_by({ title: title, film_type: (a[54] == 'short' ? 'Short' : 'Feature') })

        # languages
        data_languages = a[4]
        data_languages = data_languages.sub('Swedish/English', 'Swedish, English')
        data_languages = data_languages.sub('German & English w/ English subs', 'German, English')
        data_languages = data_languages.sub('Polish w/English subtitles', 'Polish')
        data_languages = data_languages.sub('Spanish w/English subtitles', 'Spanish')
        data_languages = data_languages.sub('German w/ English subtitles', 'German')
        data_languages = data_languages.sub('English w/English subtitles', 'English')
        data_languages = data_languages.sub('English/Malay', 'English, Malay')
        data_languages = data_languages.sub('n/a', '')
        data_languages = data_languages.sub('No Dialogue', '')
        data_languages = data_languages.sub('Various', '')
        data_languages = data_languages.sub('with English subs', '')
        data_languages = data_languages.split(",").map(&:strip)
        film_languages = film.film_languages
        languages = film_languages.map { |fl| fl.language.name }
        if data_languages.sort != languages.sort
          # order by what's in new database
          film_languages.each_with_index do |film_language, index|
            film_language.update(order: index)
          end
        else
          # order by what's in VB database
          data_languages.each_with_index do |data_language, index|
            lang = Language.find_by_name(data_language)
            FilmLanguage.find_by(film_id: film.id, language_id: lang.id).update(order: index)
          end
        end

        # countries
        data_countries = a[3]
        data_countries = data_countries.sub('US,', 'USA,')
        data_countries = data_countries.sub(/US\z/, 'USA')
        data_countries = data_countries.sub('U.S.', 'USA')
        data_countries = data_countries.sub('UK', 'United Kingdom')
        data_countries = data_countries.sub('Switzerland | France', 'Switzerland, France')
        data_countries = data_countries.sub('Itally', 'Italy')
        data_countries = data_countries.split(',').map(&:strip)
        film_countries = film.film_countries
        countries = film_countries.map { |fc| fc.country.name }
        if data_countries.sort != countries.sort
          # order by what's in new database
          film_countries.each_with_index do |film_country, index|
            film_country.update(order: index)
          end
        else
          # order by what's in VB database
          data_countries.each_with_index do |data_country, index|
            count = Country.find_by_name(data_country)
            FilmCountry.find_by(film_id: film.id, country_id: count.id).update(order: index)
          end
        end

        # genres
        data_genres = a[55]
        data_genres = data_genres.split('\n').map(&:strip)
        film_genres = film.film_genres
        genres = film_genres.map { |fg| fg.genre.name }
        if data_genres.sort != genres.sort
          # order by what's in new database
          film_genres.each_with_index do |film_genre, index|
            film_genre.update(order: index)
          end
        else
          # order by what's in VB database
          data_genres.each_with_index do |data_genre, index|
            g = Genre.find_by_name(data_genre)
            FilmGenre.find_by(film_id: film.id, genre_id: g.id).update(order: index)
          end
        end

        # actors
        data_actors = a[20]
        data_actors = data_actors.sub('Virginia  Méndez', 'Virginia Méndez')
        data_actors = data_actors.sub('Georges  Khabbaz', 'Georges Khabbaz')
        data_actors = data_actors.sub('Leo  Minaya', 'Leo Minaya')
        data_actors = data_actors.sub('Ilka  W. Fischer', 'Ilka W. Fischer')
        data_actors = data_actors.sub('Aaron  Richard Golub', 'Aaron Richard Golub')
        data_actors = data_actors.sub('Audrey Cumings', 'Audrey Cummings')
        data_actors = data_actors.sub('Anatole Taubmann', 'Anatole Taubman')
        data_actors = data_actors.split(',').map(&:strip)
        data_actors.delete("")
        actors = film.actors
        names = actors.map { |actor| "#{actor.first_name}#{actor.first_name && actor.last_name ? ' ' : ''}#{actor.last_name}" }
        if data_actors.sort != names.sort
          # order by what's in new database
          actors.each_with_index do |actor, index|
            actor.update(order: index)
          end
        else
          # order by what's in VB database
          data_actors.each_with_index do |name, index|
            act = Actor.find_by({ film_id: film.id, first_name: name.split(' ')[0], last_name: name.split(' ')[-1] })
            act = Actor.find_by({ film_id: film.id, first_name: "#{name.split(' ')[0]} #{name.split(' ')[1]}", last_name: name.split(' ')[-1] }) if !act
            act = Actor.find_by({ film_id: film.id, first_name: name.split(' ')[0] }) if !act
            act = Actor.find_by({ film_id: film.id, last_name: name.split(' ')[-1] }) if !act
            act = Actor.find_by({ film_id: film.id, last_name: name }) if !act
            act = Actor.find_by({ film_id: film.id, first_name: name }) if !act
            act = Actor.find_by({ film_id: film.id, last_name: "#{name.split(' ')[-2]} #{name.split(' ')[-1]}" }) if !act
            act.update(order: index)
          end
        end

        # laurels
        data_laurels = a[19]
        data_laurels = data_laurels.sub('Winner - Tom Skerritt Lumination Award  - Crested Butte Reel Fest', 'Winner - Tom Skerritt Lumination Award - Crested Butte Reel Fest')
        data_laurels = data_laurels.sub('NOMINTAED - Audience Award , SXSW FF (2012)', 'Nominated - Audience Award - SXSW Film Festival')
        data_laurels = data_laurels.sub('Torino Film Festival, Namur International Festival of French-Speaking Film', 'Official Selection - Torino Film Festival\nOfficial Selection - Namur International Festival of French-Speaking Film')
        data_laurels = data_laurels.sub("FIPRESCI Award -- 57th Thessaloniki Int'l. Film Festival", "FIPRESCI Award - 57th Thessaloniki Int'l. Film Festival")
        data_laurels = data_laurels.sub("Official Selection- Rendezvous with French Cinema, New York", "Official Selection - Rendezvous with French Cinema, New York")
        data_laurels = data_laurels.sub("Winner - 1-2 Award for Best Film - Warsaw Int'l. Film Festival", "Winner - Competition 1-2 Award - Warsaw Int'l Film Festival")
        data_laurels = data_laurels.sub("Winner - Silver Hobby-Horse - Best Director - Krakow Film Festival", "Winner - Best Director - Krakow Film Festival")
        data_laurels = data_laurels.sub("Winner - Silver Horn - Best Feature - Krakow Film Festival", "Winner - Best Feature - Krakow Film Festival")
        data_laurels = data_laurels.sub("Winner - Best Cinematographer - Tallin Black Nights FF (2016)", "Winner - Best Cinematographer - Tallinn Black Nights Film Festival")
        data_laurels = data_laurels.sub("Winner - Best Director - Shanghai Int'l. Film Festival", "Winner - Best Director - Shanghai Int'l Film Festival")
        data_laurels = data_laurels.sub("Winner - FIPRESCI Prize - Best Int'l. Film - Uruguay Int'l. Film Festival", "Winner - FIPRESCI Award for Best International Feature Film - Uruguay Int'l Film Festival")
        data_laurels = data_laurels.sub("Winner - FIPRESCI Prize, Panorama - Berlin Int'l. Film Festival", "Winner - FIPRESCI Award for Best Film in the Panorama Section - Berlin Int'l Film Festival")
        data_laurels = data_laurels.sub("Winner - Jury Award - Best Documentary - Rockport Film Festival", "Winner - Best Documentary Feature - Rockport Film Festival")
        data_laurels = data_laurels.sub("Short-listed - Best Live-Action Short - Academy Awards", "")
        data_laurels = data_laurels.sub("Guatemala's submission to the Academy Awards for Best Foreign Language Film", "")
        data_laurels = data_laurels.sub("Winner - Best Film - Asian New Wave - Q Cinema International Film Festival", "Winner - Best Film, Asian New Wave - QCinema Int'l Film Festival")
        data_laurels = data_laurels.sub("Winner - Interfaith Award - Best Narrative Feature - St. Louis International Film Festival", "Winner - Best Narrative Feature, Interfaith Awards - St. Louis Int'l Film Festival")
        data_laurels = data_laurels.sub("OFFICIAL SELECTION - Karlovy Vary Int'l Film Festival WINNER - Best Director - European Film Festival Palic", "Official Selection - Karlovy Vary Int'l Film Festival\\nWinner - Best Director - Palić Film Festival")
        data_laurels = data_laurels.sub("Norway’s Submission to the Academy Awards", "")
        data_laurels = data_laurels.sub("Winner - John Schlesinger Award- Best Narrative - Provincetown Int'l Film Festival", "Winner - John Schlesinger Award, Best Narrative - Provincetown Int'l Film Festival")
        data_laurels = data_laurels.sub("Official Selection – Sundance Film Festival", "Official Selection - Sundance Film Festival")
        data_laurels = data_laurels.sub("Winner of 5 Israeli Academy Awards", "")
        data_laurels = data_laurels.sub("India Int'l Film Festival", "")
        data_laurels = data_laurels.sub("Official Selection - Cine-world Film Festival", "Official Selection - Cine-World Film Festival")
        data_laurels = data_laurels.sub("Official Selection - Donostia-San Sebastian International Film Festival", "Official Selection - San Sebastian International Film Festival")
        data_laurels = data_laurels.sub("Winner - Int'l Jury Award - Best Int'l Short Film - Cork Int'l Film Festival", "")
        data_laurels = data_laurels.sub("Winner - Best Short Film  - Berlin Int'l Film Festival", "Winner - Best Short Film - Berlin Int'l Film Festival")
        data_laurels = data_laurels.sub("Croatia's submission to the 2003 Academy Awards", "")
        data_laurels = data_laurels.sub("Uruguay's submission to the 2007 Academy Awards", "")
        data_laurels = data_laurels.sub("Slovenia's submission to the 2003 Academy Awards", "")
        data_laurels = data_laurels.sub("Official Selection  - Sundance Film Festival", "Official Selection - Sundance Film Festival")
        data_laurels = data_laurels.sub("Official Selection - Amer-Asia Film Festival", "Official Selection - AmerAsia Film Festival")
        data_laurels = data_laurels.sub("Official Selection - Sundance Int'l Film Festival", "Official Selection - Sundance Film Festival")
        data_laurels = data_laurels.sub("Winner - Best Film- Starz Denver Film Festival", "Winner - Best Film - Starz Denver Film Festival")
        data_laurels = data_laurels.sub("Official Selection - Roterdam Int'l Film Festival", "Official Selection - Rotterdam Int'l Film Festival")
        data_laurels = data_laurels.split('\n').map(&:strip)
        data_laurels.delete("")
        laurels = film.laurels
        laurel_strings = laurels.map { |laurel| "#{laurel.result} - #{laurel.award_name.empty? ? '': (laurel.award_name + ' - ')}#{laurel.festival}" }
        if data_laurels.sort != laurel_strings.sort
          # order by what's in new database
          laurels.each_with_index do |laurel, index|
            laurel.update(order: index)
          end
        else
          # order by what's in VB database
          data_laurels.each_with_index do |laurel, index|
            relation = Laurel.where(film_id: film.id, festival: laurel.split(' - ')[-1])
            if relation.count == 1
              relation.first.update(order: index)
            else
              p film.title
              p laurel
              sections = laurel.split(' - ').count
              if sections == 3
                Laurel.find_by({ film_id: film.id, festival: laurel.split(' - ')[-1], award_name: laurel.split(' - ')[-2] }).update(order: index)
              elsif sections == 2
                Laurel.find_by({ film_id: film.id, festival: laurel.split(' - ')[-1], result: laurel.split(' - ')[-2] }).update(order: index)
              end
            end
          end
        end

        # quotes
        data_quotes = []
        data_quotes << a[26] unless a[26].empty?
        data_quotes << a[27] unless a[27].empty?
        data_quotes << a[28] unless a[28].empty?
        quotes = film.quotes
        quote_texts = quotes.map { |quote| quote.text }
        if data_quotes.sort != quote_texts.sort
          # order by what's in new database
          quotes.each_with_index do |quote, index|
            quote.update(order: index)
          end
        else
          # order by what's in VB database
          data_quotes.each_with_index do |quote, index|
            q = Quote.find_by_text(quote)
            q.update(order: index)
          end
        end

        films += 1
      end
      p mismatched_laurels
      titles_not_in_file = Film.all.pluck(:title) - titles
      titles_not_in_file.each do |title|
        film = Film.find_by_title(title)
        film.film_languages.each_with_index do |fl, index|
          fl.update(order: index)
        end
        film.film_countries.each_with_index do |fc, index|
          fc.update(order: index)
        end
        film.film_genres.each_with_index do |fg, index|
          fg.update(order: index)
        end
        film.actors.each_with_index do |a, index|
          a.update(order: index)
        end
      end
    end
  end

  def self.partial_import(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/Films.txt")
    object.get(response_target: "tmp/#{time_started}/Films.txt")
    result = []
    File.open(Rails.root.join("tmp/#{time_started}/Films.txt")) do |file|
      total = file.gets.to_i
      films = 0
      until films == total
        a = file.gets.split("\t")
        if a[1].empty? || a[1][0..8] == "(NEW FILM" || ["Captive Beauty", "The Dark Sea", "The Condemned", "Camino del Vino", "Mundo Secreto", "Sal", "Chance", "Nairobi Half Life", "School's Out", "Something Necessary", "War Witch", "Things From Another World", "Pulce is Not Here", "Climate of Change", "Fire in Babylon", "Booker's Place: A Mississippi Story", "Boys of Summer", "Felony", "Deep Throat Part II Collection", "Quality Time", "Smitten!"].include?(a[1])
          films += 1
          next
        end

        title = a[1]
        if title == "As If I'm Not There"
          title = "As If I Am Not There"
        end
        p title
        film = Film.find_by({ title: title, film_type: (a[54] == 'short' ? 'Short' : 'Feature') })

        sound_config = a[43]
        rating = a[350]
        film.update(sound_config: sound_config, rating: rating)

        films += 1
      end
    end
  end

  def self.check_genres(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/Films.txt")
    object.get(response_target: "tmp/#{time_started}/Films.txt")
    existing_genres = Genre.all.pluck(:name)
    result = []
    File.open(Rails.root.join("tmp/#{time_started}/Films.txt")) do |file|
      total = file.gets.to_i
      films = 0
      until films == total
        a = file.gets.split("\t")
        if a[1].empty? || a[1][0..8] == "(NEW FILM" || ["Captive Beauty", "The Dark Sea", "The Condemned", "Camino del Vino", "Mundo Secreto", "Sal", "Chance", "Nairobi Half Life", "School's Out", "Something Necessary", "War Witch", "Things From Another World", "Pulce is Not Here", "Climate of Change", "Fire in Babylon", "Booker's Place: A Mississippi Story", "Boys of Summer", "Felony", "Deep Throat Part II Collection"].include?(a[1])
          films += 1
          next
        end

        film = Film.find_by({ title: a[1], film_type: (a[54] == 'short' ? 'Short' : 'Feature') })

        text = a[5]
        genres = text.split(/[,\/]/).map(&:strip)

        genres.each do |genre|
          if genre == 'drama'
            genre = 'Drama'
          elsif genre == 'Animated' || genre == 'Animated Short'
            genre = 'Animation'
          elsif genre == 'Biopic'
            genre = 'Biography'
          elsif genre == 'Dramatic thriller'
            genre = 'Thriller'
          elsif genre == 'Sports documentary'
            genre = 'Sports'
          elsif genre == 'Sci Fi'
            genre = 'Science Fiction'
          elsif genre == 'Sci-Fi'
            genre = 'Science Fiction'
          end
          g = Genre.find_by_name(genre)
          if g
            unless FilmGenre.find_by({ film_id: film.id, genre_id: g.id })
              p 'adding film genre!'
              FilmGenre.create({ film_id: film.id, genre_id: g.id })
            end
          end
        end

        films += 1
      end
    end

  end

  def self.import_films(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/Films.txt")
    object.get(response_target: "tmp/#{time_started}/Films.txt")
    File.open(Rails.root.join("tmp/#{time_started}/Films.txt")) do |file|
      total = file.gets.to_i
      films = 0
      until films == total
        a = file.gets.split("\t")
        if a[1].empty? || a[1][0..8] == "(NEW FILM" || ["Captive Beauty", "The Dark Sea", "The Condemned", "Camino del Vino", "Mundo Secreto", "Sal", "Chance", "Nairobi Half Life", "School's Out", "Something Necessary", "War Witch", "Things From Another World", "Pulce is Not Here", "Climate of Change", "Fire in Babylon", "Booker's Place: A Mississippi Story", "Boys of Summer", "Felony", "Deep Throat Part II Collection"].include?(a[1])
          films += 1
          next
        end

        # first check for new licensor
        licensor = Licensor.find_by_name(a[8].strip)

        if licensor && (licensor.email == nil || licensor.email == "")
          licensor.update(email: a[240].strip)
        end
        if !licensor && a[54] != "short"
          licensor = Licensor.create(name: a[8].strip, email: a[240].strip)
        end

        # then add/update film

        if a[301] == "True"
          label_id = 2
        elsif a[300] == "True"
          label_id = 3
        elsif a[192] == "True"
          label_id = 4
        else
          label_id = 1
        end

        film_vars = {
          film_type: (a[54] == 'short' ? 'Short' : 'Feature'),
          start_date: (a[9] == '12:00:00 AM' ? '' : a[9]),
          svod_release: (a[218] == '12:00:00 AM' ? '' : a[218]),
          svod_tentative: (a[236] == 'True'),
          theatrical_release: (a[208] == '12:00:00 AM' ? '' : a[208]),
          theatrical_tentative: (a[221] == 'True'),
          tvod_release: (a[340] == '12:00:00 AM' ? (a[338] == '12:00:00 AM' ? (a[216] == '12:00:00 AM' ? (a[215] == '12:00:00 AM' ? (a[214] == '12:00:00 AM' ? (a[211] == '12:00:00 AM' ? (a[209] == '12:00:00 AM' ? '' : a[209]) : a[211]) : a[214]) : a[215]) : a[216]) : a[338]) : a[340]),
          tvod_tentative: (a[340] == '12:00:00 AM' ? (a[338] == '12:00:00 AM' ? (a[216] == '12:00:00 AM' ? (a[215] == '12:00:00 AM' ? (a[214] == '12:00:00 AM' ? (a[211] == '12:00:00 AM' ? (a[209] == '12:00:00 AM' ? '' : a[222] == 'True') : a[224] == 'True') : a[229] == 'True') : a[226] == 'True') : a[227] == 'True') : a[339] == 'True') : a[341] == 'True'),
          title: a[1],
          licensor_id: licensor ? licensor.id : nil,
          deal_type_id: a[241] == "Template A" ? 1 : (a[241] == "Template B" ? 2 : (a[241] == "Template B (Theat. Only)" ? 3 : (a[241] == "Template C" ? 4 : (a[241] == "Template D" ? 5 : (a[241] == "Template E" ? 6 : nil))))),
          days_statement_due: a[54] == "short" ? nil : (a[357] == "0" ? 30 : a[357]),
          gr_percentage: a[326],
          mg: a[11],
          e_and_o: a[242],
          expense_cap: a[358],
          sage_id: a[276],
          royalty_notes: a[337],
          send_reports: a[348] == "False",
          year: a[7].to_i,
          length: a[6].to_i,
          synopsis: a[18],
          short_synopsis: a[81],
          vod_synopsis: a[204],
          logline: a[189],
          institutional_synopsis: a[355],
          vimeo_trailer: a[97],
          youtube_trailer: a[98],
          prores_trailer: a[343],
          standalone_site: a[347],
          facebook_link: a[344],
          twitter_link: a[345],
          instagram_link: a[346],
          label_id: label_id,
          # active: (a[53] != '12:00:00 AM'),
          # edu_page: (a[54] != 'short' && (label_id == 1 || label_id == 3)),
          # video_page: (a[54] != 'short' && (label_id == 1 || label_id == 3))
        }
        if a[21] != '12:00:00 AM'
          film_vars[:club_date] = a[21]
        end
        film = Film.find_by({ title: film_vars[:title], film_type: film_vars[:film_type] })
        if film
          film.update!(film_vars)
          if a[52].empty? || a[52] == '12:00:00 AM'
            if film.start_date
              film_vars[:end_date] = film.start_date + a[10].to_i.years
            end
          else
            film_vars[:end_date] = a[52]
          end
          film.update!(end_date: film_vars[:end_date])
        else
          p "Adding Film: #{film_vars[:title]}"
          film = Film.create!(film_vars)

          unless film.film_type == 'Short'
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 1).update(value: a[243]) #Theatrical
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 2).update(value: a[244]) #Non-Theatrical
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 3).update(value: a[249]) #Video
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 4).update(value: a[253]) #Commercial Video
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 5).update(value: a[247]) #VOD
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 6).update(value: a[246]) #SVOD
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 7).update(value: a[307]) #TVOD
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 8).update(value: a[306]) #AVOD
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 9).update(value: a[305]) #FVOD
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 10).update(value: a[248]) #Other Internet
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 11).update(value: a[250]) #Ancillary
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 12).update(value: a[245]) #TV
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 13).update(value: a[251]) #Club
            FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: 14).update(value: a[252]) #Jewish
          end
        end
        film.save!
        @@vb_film_ids[a[0]] = film.id

        # FILM RIGHTS:

        # what territories does this film have?
        film_territories = ['USA']
        film_territories += ['Anglophone Canada', 'French-speaking Canada'] if a[12] == 'Yes'
        film_territories += ['Anglophone Canada'] if a[12] == 'Anglophone'

        all_territories = Territory.all.pluck(:name)

        additional_territories = a[327]
        unless additional_territories.empty?
          if additional_territories == "The World" || additional_territories == "World" || additional_territories == "Worldwide"
            film_territories += all_territories
          elsif ["Bermuda, Bahamas, Caribbean Basin", "Bermuda, Bahamas, Carribean Basin", "Non-exclusive Bahamas, Bermuda, Caribbean Basin", "Non-excl. Bahamas, Bermuda, Caribbean Basin", "Non-exc. Bahamas, Bermuda, Caribbean Basin", "Bermuda, Bahamas, the Caribbean Basin", "Non-excl. in Bahamas, Bermudas, Caribbean Basin", "Non-excl. Bermuda, Bahamas, Caribbean", "non-exclusively Bermuda, Bahamas, Caribbean Basin", "Non-excl:  Bermuda, Bahamas, Caribbean Basin", "Bermuda, Bahamas, Carribean Basin (non-exc)", "Bahams, Bermuda, Carribean Basin", "Bahamas, Bermuda, Carribean Basin", "Non-exc. Bermuda, Bahamas, Caribbean Basin", "Non-exclusive Bermuda, Bahamas, Caribbean Basin", "Non-excl Bahamas, Bermuda, Caribbean Basin", "Non-exclusive in Bahamas, Bermuda, Caribbean Basin", "Bermuda, Bahamas, Caribbean", "Bermuda, Bahamas, non-exclusive in Caribbean", "Bermuda, Bahamas, non-exclusive Carribean Basin", "Bermuda, Bahamas, Caribbean non-exclusive", "Non-Exclusive Bermuda, Bahamas, Caribbean Basin", "Non-excl. Bermuda, Bahamas, Caribbean Basin", "Bahamas, Bermuda, Caribbean Basin", "Caribbean Basin, non-exclusive in Bahamas/Bermuda", 'Bermuda, Bahamas, non-exclusive in Caribbean Basin', 'Bermuda, Bahamas, Non-exclusively Caribbean Basin', 'Bahams, Bermuda, Saba Island, Eustatius, Kitts, Maarten, Carriben Basin'].include?(additional_territories)
            film_territories += ['Bermuda', 'Bahamas', 'Caribbean Basin']
          elsif ['Bermuda, The Bahamas', 'Non-excl. Bermuda and Bahamas', 'Non-exclusive Bermuda and Bahamas', 'Bermuda, Bahamas (non-exclusive)', 'Bahamas, Bermuda, Saba Island, St. Eustatius Island, St. Kitts Island, St. Maarten Island', 'Bahamas, Bermuda, Saba Island, St. Eustatius, St. Kitts, St. Maarten', 'Bahamas, Bermuda, Saba Island, St. Eustatiuis Island, St. Kitts Island, St. Maarten Island'].include?(additional_territories)
            film_territories += ['Bermuda', 'Bahamas']
          elsif ['Carribean Basin'].include?(additional_territories)
            film_territories += ['Caribbean Basin']
          elsif additional_territories == 'UK, Ireland, Australia, NZ, Bermuda, Bahamas, Caribbean'
            film_territories += ['UK', 'Ireland', 'Australia', 'New Zealand', 'Bermuda', 'Bahamas', 'Caribbean Basin']
          elsif additional_territories == 'World exc Canada, Italy, Poland; Canada DVD'
            film_territories += (all_territories - ['Anglophone Canada', 'French-speaking Canada', 'Italy', 'Poland'])
          elsif additional_territories == 'Australia, New Zealand, UK'
            film_territories += ['UK', 'Australia', 'New Zealand']
          elsif additional_territories == 'Worldwide except Japan, Israel, Hungary'
            film_territories += (all_territories - ['Japan', 'Israel', 'Hungary'])
          elsif additional_territories == 'Non-exclusive for rest of world excluding Netherlands'
            film_territories += (all_territories - ['Netherlands'])
          elsif additional_territories == 'Worldwide except Serbia, Kosovo, Croatia, Slovenia, Macedonia'
            film_territories += (all_territories - ['Serbia', 'Kosovo', 'Croatia', 'Slovenia', 'Macedonia'])
          elsif additional_territories == 'World excluding France, Argentina, Mexico, Spain, Australia, New Zealand, Central America, Greece, Taiwan, Brazil, Turkey'
            film_territories += (all_territories - ['France', 'Argentina', 'Mexico', 'Spain', 'Australia', 'New Zealand', 'Greece', 'Taiwan', 'Brazil', 'Turkey', 'Belize', 'Guatemala', 'Costa Rica', 'Nicaragua', 'Honduras', 'Panama', 'El Salvador'])
          elsif additional_territories == 'Australia, New Zealand, UK, Ireland, Bermuda, Bahamas, Caribbean Basin'
            film_territories += ['Australia', 'New Zealand', 'UK', 'Ireland', 'Bermuda', 'Bahamas', 'Caribbean Basin']
          else
            p "#{film.title} - #{additional_territories}"
          end
        end

        film_territory_ids = film_territories.uniq.map do |territory_name|
          Territory.find_by_name(territory_name).id
        end

        # create rights

        if a[57] == 'True' # Theatrical
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 1, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 1, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[17] == 'True'
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 2, territory_id: territory_id) # Educational
              FilmRight.create!(film_id: film.id, right_id: 2, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 3, territory_id: territory_id) # Festival
              FilmRight.create!(film_id: film.id, right_id: 3, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 4, territory_id: territory_id) # Other Non-Theatrical
              FilmRight.create!(film_id: film.id, right_id: 4, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[59] == 'True' # SVOD
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 5, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 5, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[60] == 'True' # TVOD (Cable)
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 6, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 6, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[102] == 'True' # EST/DTR
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 7, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 7, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[66] == 'True' # Pay TV
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 8, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 8, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[67] == 'True' # Free TV
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 9, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 9, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[61] == 'True' # FVOD
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 10, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 10, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[104] == 'True' # AVOD
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 11, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 11, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[16] == 'True' # DVD/Video
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 12, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 12, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[62] == 'True' # Hotels
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 13, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 13, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[63] == 'True' # Airlines
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 14, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 14, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[64] == 'True' # Ships
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 15, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 15, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        if a[64] == 'True' # Ships
          film_territory_ids.each do |territory_id|
            unless FilmRight.find_by(film_id: film.id, right_id: 15, territory_id: territory_id)
              FilmRight.create!(film_id: film.id, right_id: 15, territory_id: territory_id, start_date: film_vars[:start_date], end_date: film_vars[:end_date], exclusive: true)
            end
          end
        end

        # retail dvd
        retail_dvd_vars = {
          dvd_type_id: 1,
          feature_film_id: film.id,
          price: a[35],
          pre_book_date: (a[36] == "12:00:00 AM" ? nil : a[36]),
          retail_date: (a[37] == "12:00:00 AM" ? nil : a[37]),
          upc: a[39],
          repressing: a[89],
          sound_config: a[206],
          special_features: a[365],
          discs: (a[367].to_i == 0 ? 1 : a[367].to_i),
          units_shipped: a[91],
          first_shipment: a[90]
        }
        if retail_dvd_vars[:upc] != ""
          retail_dvd = Dvd.where(dvd_type_id: 1, feature_film_id: film.id)[0]
          if (retail_dvd)
            retail_dvd.update!(retail_dvd_vars)
          else
            Dvd.create!(retail_dvd_vars)
          end
        end

        # club dvd
        club_dvd_vars = {
          dvd_type_id: 2,
          feature_film_id: film.id,
          price: a[35],
          upc: a[38],
          repressing: a[84],
          sound_config: a[206],
          special_features: a[365],
          discs: 1,
          units_shipped: a[86],
          first_shipment: a[85]
        }
        if club_dvd_vars[:upc] != "(No Club Version)" && club_dvd_vars[:upc] != ""
          club_dvd = Dvd.where(dvd_type_id: 2, feature_film_id: film.id)[0]
          if (club_dvd)
            club_dvd.update!(club_dvd_vars)
          else
            Dvd.create!(club_dvd_vars)
          end
        end

        # institutional dvd
        institutional_dvd_vars = {
          dvd_type_id: 5,
          feature_film_id: film.id,
          price: a[369],
          upc: a[353],
          repressing: a[361],
          sound_config: a[206],
          special_features: a[365],
          discs: (a[367].to_i == 0 ? 1 : a[367].to_i),
          units_shipped: a[363],
          first_shipment: a[362]
        }
        if institutional_dvd_vars[:upc] != ""
          institutional_dvd = Dvd.where(dvd_type_id: 5, feature_film_id: film.id)[0]
          if (institutional_dvd)
            institutional_dvd.update!(institutional_dvd_vars)
          else
            Dvd.create!(institutional_dvd_vars)
          end
        end

        # spanish dvd
        spanish_dvd_vars = {
          dvd_type_id: 4,
          feature_film_id: film.id,
          price: a[47],
          upc: a[46],
          repressing: false,
          sound_config: a[206],
          special_features: a[365],
          discs: (a[367].to_i == 0 ? 1 : a[367].to_i),
          units_shipped: a[51],
          first_shipment: a[50]
        }
        if spanish_dvd_vars[:upc] != ""
          spanish_dvd = Dvd.where(dvd_type_id: 4, feature_film_id: film.id)[0]
          if (spanish_dvd)
            spanish_dvd.update!(spanish_dvd_vars)
          else
            Dvd.create!(spanish_dvd_vars)
          end
        end

        # blu-ray
        blu_ray_vars = {
          dvd_type_id: 6,
          feature_film_id: film.id,
          pre_book_date: (a[194] == "12:00:00 AM" ? nil : a[194]),
          retail_date: (a[195] == "12:00:00 AM" ? nil : a[195]),
          price: a[197],
          upc: a[196],
          repressing: a[200],
          sound_config: a[206],
          special_features: a[365],
          discs: (a[368].to_i == 0 ? 1 : a[368].to_i),
          units_shipped: a[202],
          first_shipment: a[201]
        }
        if blu_ray_vars[:upc] != ""
          blu_ray = Dvd.where(dvd_type_id: 6, feature_film_id: film.id)[0]
          if (blu_ray)
            blu_ray.update!(blu_ray_vars)
          else
            Dvd.create!(blu_ray_vars)
          end
        end

        # jfc
        jfc_dvd_vars = {
          dvd_type_id: 3,
          feature_film_id: film.id,
          price: a[35],
          upc: a[40],
          repressing: a[94],
          sound_config: a[206],
          special_features: a[365],
          discs: 1,
          units_shipped: a[6],
          first_shipment: a[5]
        }
        if jfc_dvd_vars[:upc] != ""
          jfc_dvd = Dvd.where(dvd_type_id: 3, feature_film_id: film.id)[0]
          if (jfc_dvd)
            jfc_dvd.update!(jfc_dvd_vars)
          else
            Dvd.create!(jfc_dvd_vars)
          end
        end

        # countries
        country_strings = a[3].split(",").map(&:strip)
        country_strings.each do |country_string|
          next if country_string == 'Switzerland | France'
          next if country_string == 'Itally'
          country_string = "United Kingdom" if country_string == "UK"
          country_string = "USA" if country_string == "US"
          country_string = "USA" if country_string == "U.S."
          country = Country.find_by_name(country_string)
          unless country
            country = Country.create!(name: country_string)
          end
          unless FilmCountry.find_by(film_id: film.id, country_id: country.id)
            FilmCountry.create!(film_id: film.id, country_id: country.id)
          end
        end

        # languages
        a[4].gsub!("Dutch & English w/English subtitles", "Dutch, English")
        a[4].gsub!("English/Malay", "English, Malay")
        a[4].gsub!("n/a", "")
        a[4].gsub!("No Dialogue", "")
        a[4].gsub!("Polish w/English subtitles", "")
        a[4].gsub!("Russian & German w/ English subtitles", "Russian, German")
        a[4].gsub!("Spanish w/English subtitles", "Spanish")
        a[4].gsub!("Swedish/English", "Swedish, English")
        a[4].gsub!("with English subs", "")
        a[4].gsub!("Various", "")
        a[4].gsub!("German & English w/ English subs", "German, English")
        a[4].gsub!("English w/English subtitles", "English")
        a[4].gsub!("German w/ English subtitles", "German")

        language_strings = a[4].split(",").map(&:strip)
        language_strings.each do |language_string|
          next if language_string.empty?
          language = Language.find_by_name(language_string)
          unless language
            language = Language.create!(name: language_string)
          end
          unless FilmLanguage.find_by(film_id: film.id, language_id: language.id)
            FilmLanguage.create!(film_id: film.id, language_id: language.id)
          end
        end

        # genres
        genre_strings = a[55].split('\n').map(&:strip)
        genre_strings.each do |genre_string|
          next if genre_string.empty?
          genre = Genre.find_by_name(genre_string)
          unless genre
            genre = Genre.create!(name: genre_string)
          end
          unless FilmGenre.find_by(film_id: film.id, genre_id: genre.id)
            FilmGenre.create!(film_id: film.id, genre_id: genre.id)
          end
        end

        # topics
        topic_strings = a[364].split('\n').map(&:strip)
        topic_strings.each do |topic_string|
          next if topic_string.empty?
          topic = Topic.find_by_name(topic_string)
          unless topic
            topic = Topic.create!(name: topic_string)
          end
          unless FilmTopic.find_by(film_id: film.id, topic_id: topic.id)
            FilmTopic.create!(film_id: film.id, topic_id: topic.id)
          end
        end

        # directors
        unless Director.find_by(film_id: film.id)
          director_strings = a[2].gsub(' and', ',').split(',').map(&:strip)
          director_strings.each do |director_string|
            next if director_string.empty?
            words = director_string.split(" ")
            if words.length == 1
              Director.create!(film_id: film.id, last_name: words[0])
            elsif words.length == 2
              Director.create!(film_id: film.id, first_name: words[0], last_name: words[1])
            else
              if ["da", "de", "di", "ten", "van", "von"].include?(words[-2].downcase)
                Director.create!(film_id: film.id, first_name: words[0...-2].join(" "), last_name: words[-2..-1].join(" "))
              else
                Director.create!(film_id: film.id, first_name: words[0...-1].join(" "), last_name: words[-1])
              end
            end
          end
        end

        # cast
        unless Actor.find_by(film_id: film.id)
          actor_strings = a[20].gsub(' and', ',').split(',').map(&:strip)
          actor_strings.each do |actor_string|
            next if actor_string.empty?
            words = actor_string.split(" ")
            if words.length == 1
              Actor.create!(film_id: film.id, last_name: words[0])
            elsif words.length == 2
              Actor.create!(film_id: film.id, first_name: words[0], last_name: words[1])
            else
              if ["da", "de", "di", "ten", "van", "von"].include?(words[-2].downcase)
                Actor.create!(film_id: film.id, first_name: words[0...-2].join(" "), last_name: words[-2..-1].join(" "))
              else
                Actor.create!(film_id: film.id, first_name: words[0...-1].join(" "), last_name: words[-1])
              end
            end
          end
        end

        # laurels
        unless Laurel.find_by(film_id: film.id)
          laurel_strings = a[19].split('\n').map(&:strip)
          laurel_strings.each_with_index do |laurel_string, index|
            next if laurel_string.empty?
            words = laurel_string.split("-").map(&:strip)
            if words.length == 2
              Laurel.create!(film_id: film.id, result: words[0], festival: words[1], order: index)
            elsif words.length == 3
              Laurel.create!(film_id: film.id, result: words[0], award_name: words[1], festival: words[2], order: index)
            end
          end
        end

        # quotes
        unless Quote.find_by(film_id: film.id)
          unless a[26].empty?
            Quote.create!(film_id: film.id, text: a[26], author: a[29], publication: a[32], order: 0)
          end
          unless a[27].empty?
            Quote.create!(film_id: film.id, text: a[27], author: a[30], publication: a[33], order: 1)
          end
          unless a[28].empty?
            Quote.create!(film_id: film.id, text: a[28], author: a[31], publication: a[34], order: 2)
          end
        end

        # related films
        related_strings = a[99].split('\n').map(&:strip)
        related_strings.each_with_index do |related_string, order|
          next if related_string.empty?
          related_string = "Helena from the Wedding" if related_string == "Helena From The Wedding"
          related_string = "A Life in Dirty Movies" if related_string == "A Life In Dirty Movies"
          related_string = "Anytown, USA" if related_string == "Anytown USA"
          related_string = "The Chambermaid Lynn" if related_string == "The Chambermaid"
          related_string = "King of Devil's Island" if related_string == "The King of Devil's Island"
          related_string = "Sea Fog (Haemoo)" if related_string == "Sea Fog"
          related_string = "You Will be Mine" if related_string == "You Will Be Mine"
          related_string = "In the Name of" if related_string == "In The Name Of"
          related_string = "The Greatest Ears in Town: The Arif Mardin Story" if related_string == "The Greatest Ears in Town"
          related_string = "After The Storm" if related_string == "After the Storm"
          related_string = "Time to Die" if related_string == "Time To Die"
          related_string = "A Bottle in the Gaza Sea" if related_string == "A Bottle In The Gaza Sea"
          related_string = "For a Woman" if related_string == "For A Woman"
          related_string = "Somers Town" if related_string == "Somer's Town"
          related_string = "I Am the Blues" if related_string == "I Am The Blues"
          related_string = "Theory of Obscurity: A Film About the Residents" if related_string == "Theory of Obscurity"
          related_string = "My Love, Don't Cross that River" if related_string == "My Love, Don't Cross That River"
          related_string = "Men Go to Battle" if related_string == "Men Go To Battle"
          related_string = "Hana-bi (Fireworks)" if related_string == "Hana-bi"
          related_string = "Schneider vs. Bax" if related_string == "Schneider Vs. Bax"
          related_string = "Kamikaze 89" if related_string == "Kamikaze '89"
          related_film = Film.find_by_title(related_string)
          if related_film
            unless RelatedFilm.find_by({ film_id: film.id, other_film_id: related_film.id })
              RelatedFilm.create!(film_id: film.id, other_film_id: related_film.id, order: order)
            end
          else
            p "could not find #{related_string} (#{film.title})"
          end
        end

        films += 1
      end
    end

    File.open(Rails.root.join("tmp/#{time_started}/Films.txt")) do |file|
      total = file.gets.to_i - 2
      films = 0
      until films == total
        a = file.gets.split("\t")
        next if a[1][0..8] == "(NEW FILM"
        short_title = a[24]
        unless short_title.empty?
          short = Film.find_by(title: short_title, film_type: 'Short')
          if short
            feature_title = a[1]
            feature = Film.find_by(title: feature_title, film_type: 'Feature')
            retail_dvd = Dvd.find_by(dvd_type_id: 1, feature_film_id: feature.id)
            if retail_dvd
              retail_dvd_short = DvdShort.find_by(dvd_id: retail_dvd.id, short_id: short.id)
              unless retail_dvd_short
                DvdShort.create(dvd_id: retail_dvd.id, short_id: short.id)
              end
            end
            club_dvd = Dvd.find_by(dvd_type_id: 2, feature_film_id: feature.id)
            if club_dvd
              club_dvd_short = DvdShort.find_by(dvd_id: club_dvd.id, short_id: short.id)
              unless club_dvd_short
                DvdShort.create(dvd_id: club_dvd.id, short_id: short.id)
              end
            end
            jfc_dvd = Dvd.find_by(dvd_type_id: 3, feature_film_id: feature.id)
            if jfc_dvd
              jfc_dvd_short = DvdShort.find_by(dvd_id: jfc_dvd.id, short_id: short.id)
              unless jfc_dvd_short
                DvdShort.create(dvd_id: jfc_dvd.id, short_id: short.id)
              end
            end
          end
        end
        films += 1
      end
    end
    object.delete
  end

  def self.import_formats(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/Formats.txt")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/Formats.txt"))
    format_ids = Format.all.map { |format| [format.name, format.id] }.to_h
    format_ids['HDCam'] = 6
    format_ids['HDCam SR'] = 6
    File.open(Rails.root.join("tmp/#{time_started}/Formats.txt")) do |f|
      a = f.gets.split('%')
      total = a[0].to_i
      a.shift
      films = 1
      until films == total
        film_vars = {
          vb_film_id: a[1],
          formats_string: a[2]
        }
        if @@vb_film_ids[a[1]]
          film_id = Film.find(@@vb_film_ids[a[1]]).id
          film_vars[:formats_string].split('\n').each do |fmt|
            if format_ids[fmt]
              unless FilmFormat.find_by(film_id: film_id, format_id: format_ids[fmt])
                FilmFormat.create!(film_id: film_id, format_id: format_ids[fmt])
              end
            else
              p "Format #{fmt} not recognized!"
            end
          end
        else
          # p "Could Not Find Film with VB ID: #{film_vars[:vb_film_id]}"
        end
        films += 1
        a.shift(3)
      end
    end
    object.delete
  end

  def self.import_theaters(time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/Theaters.txt")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/Theaters.txt"))
    File.open(Rails.root.join("tmp/#{time_started}/Theaters.txt")) do |f|

      a = f.gets.split('%')
      total = a[0].to_i
      a.shift
      venues = 0

      until venues == total

        venue_vars = {
          label: a[1],
          # shipping_name: a[1],
          # billing_name: a[1],
          # shipping_address1: a[2],
          # shipping_address2: a[3],
          # shipping_city: a[4],
          # shipping_state: a[5],
          # shipping_zip: a[6],
          # website: a[7],
          # email: a[9],
          # phone: a[10],
          # shipping_country: a[15],
          # billing_country: a[15],
          # billing_address1: a[16],
          # billing_address2: a[17],
          # billing_city: a[18],
          # billing_state: a[19],
          # billing_zip: a[20],
          # venue_type: a[24],
          # sage_id: a[26],
          contact_name: a[11]
        }

        if venue_vars[:label] == "Roxie Theater" && Venue.where(label: "Roxie Theater").length > 0
          venues += 1
          a.shift(27)
        elsif venue_vars[:label] == "Chicago International Film Festival" && Venue.where(label: "Chicago International Film Festival").length > 0
          venues += 1
          a.shift(27)
        elsif venue_vars[:label] == "Cinematique of Daytona" && Venue.where(label: "Cinematique of Daytona").length > 0
          venues += 1
          a.shift(27)
        else
          venue = Venue.find_by({ label: venue_vars[:label] })
          if venue
            # venue.update(venue_vars)
            venue.update(contact_name: venue_vars[:contact_name])
            venue.save!
          else
            # p "Adding Venue: #{venue_vars[:label]}"
            # venue = Venue.new(venue_vars)
          end
          venues += 1
          a.shift(27)
        end
      end
    end
    object.delete
  end

end
