class Importer < ActiveRecord::Base

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

      # dvd customers
      # total = array[0].to_i
      # array.shift
      # customers = 0
      # until customers == total
      #   if ["Blockbuster", "Blockbuster Canada", "RepNet"].include?(array[1])
      #     array.shift(7)
      #     customers += 1
      #     next
      #   end
      #   customer = DvdCustomer.find_by_name(array[1])
      #   if customer
      #     customer.update(discount: array[2], notes: array[3])
      #   else
      #     customer = DvdCustomer.new(name: array[1], discount: array[2], notes: array[3])
      #   end
      #   customer.save!
      #   array.shift(7)
      #   customers += 1
      # end
    end
    object.delete
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
      total = file.gets.to_i - 2
      films = 0
      until films == total
        a = file.gets.split("\t")
        if a[1].empty? || a[1][0..8] == "(NEW FILM" || ["Captive Beauty", "The Dark Sea", "The Condemned", "Camino del Vino", "Mundo Secreto", "Sal", "Chance", "Nairobi Half Life", "School's Out", "Something Necessary", "War Witch", "Things From Another World", "Pulce is Not Here", "Climate of Change", "Fire in Babylon", "Booker's Place: A Mississippi Story", "Boys of Summer", "Felony", "Deep Throat Part II Collection"].include?(a[1])
          films += 1
          next
        end

        # first check for new licensor
        licensor = Licensor.find_by_name(a[8])
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
          title: a[1],
          short_film: a[54] == "short",
          label_id: 0,
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
          active: (a[53] != "12:00:00 AM")
        }
        film = Film.find_by({title: film_vars[:title], short_film: film_vars[:short_film]})
        if film
          film.update(film_vars)
        else
          p "Adding Film: #{film_vars[:title]}"
          film = Film.create(film_vars)

          FilmRight.create!(film_id: film.id, right_id: 1, value: a[57] == 'True') # Theatrical
          FilmRight.create!(film_id: film.id, right_id: 2, value: a[17] == 'True') # Educational
          FilmRight.create!(film_id: film.id, right_id: 3, value: a[17] == 'True') # Festival
          FilmRight.create!(film_id: film.id, right_id: 4, value: a[17] == 'True') # Other Non-Theatrical
          FilmRight.create!(film_id: film.id, right_id: 5, value: a[59] == 'True') # SVOD
          FilmRight.create!(film_id: film.id, right_id: 6, value: a[60] == 'True') # TVOD (Cable)
          FilmRight.create!(film_id: film.id, right_id: 7, value: a[102] == 'True') # EST/DTR
          FilmRight.create!(film_id: film.id, right_id: 8, value: a[66] == 'True') # Pay TV
          FilmRight.create!(film_id: film.id, right_id: 9, value: a[67] == 'True') # Free TV
          FilmRight.create!(film_id: film.id, right_id: 10, value: a[61] == 'True') # FVOD
          FilmRight.create!(film_id: film.id, right_id: 11, value: a[104] == 'True') # AVOD
          FilmRight.create!(film_id: film.id, right_id: 12, value: a[16] == 'True') # DVD/Video
          FilmRight.create!(film_id: film.id, right_id: 13, value: a[62] == 'True') # Hotels
          FilmRight.create!(film_id: film.id, right_id: 14, value: a[63] == 'True') # Airlines
          FilmRight.create!(film_id: film.id, right_id: 15, value: a[64] == 'True') # Ships
          FilmRight.create!(film_id: film.id, right_id: 16, value: true) # FM Subscription

          unless film.short_film
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
          short = Film.find_by_title(short_title)
          if short
            feature_title = a[1]
            feature = Film.find_by_title(feature_title)
            retail_dvd = Dvd.find_by(dvd_type_id: 1, feature_film_id: feature.id)
            retail_dvd_short = DvdShort.find_by(dvd_id: retail_dvd.id, short_id: short.id)
            unless retail_dvd_short
              DvdShort.create(dvd_id: retail_dvd.id, short_id: short.id)
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
          shipping_name: a[1],
          billing_name: a[1],
          shipping_address1: a[2],
          shipping_address2: a[3],
          shipping_city: a[4],
          shipping_state: a[5],
          shipping_zip: a[6],
          website: a[7],
          email: a[9],
          phone: a[10],
          shipping_country: a[15],
          billing_country: a[15],
          billing_address1: a[16],
          billing_address2: a[17],
          billing_city: a[18],
          billing_state: a[19],
          billing_zip: a[20],
          venue_type: a[24],
          sage_id: a[26]
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
            venue.update(venue_vars)
          else
            p "Adding Venue: #{venue_vars[:label]}"
            venue = Venue.new(venue_vars)
          end
          venue.save!
          venues += 1
          a.shift(27)
        end
      end
    end
    object.delete
  end

end
