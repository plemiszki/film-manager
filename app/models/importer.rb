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
      total = array[0].to_i
      array.shift
      customers = 0
      until customers == total
        if ["Blockbuster", "Blockbuster Canada", "RepNet"].include?(array[1])
          array.shift(7)
          customers += 1
          next
        end
        customer = DvdCustomer.find_by_name(array[1])
        if customer
          customer.update(discount: array[2], notes: array[3])
        else
          customer = DvdCustomer.new(name: array[1], discount: array[2], notes: array[3])
        end
        customer.save!
        array.shift(7)
        customers += 1
      end
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
        next if a[1][0..8] == "(NEW FILM"

        # first check for new licensor
        licensor = Licensor.find_by_name(a[8])
        if licensor && (licensor.email == nil || licensor.email == "")
          licensor.update(email: a[240].strip)
        end
        if !licensor && a[54] != "short"
          licensor = Licensor.create(name: a[8].strip, email: a[240].strip)
        end

        # then add/update film
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
          send_reports: a[348] == "False"
          # TODO: feature id
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

        films += 1
      end
    end
    object.delete
  end

end
