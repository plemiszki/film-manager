class Importer < ActiveRecord::Base

  def self.import_licensors
    File.open(Rails.root.join('data/Admin.txt')) do |f|
      array = f.gets.split('^')
      total = array[0].to_i
      array.shift
      licensors = 0
      until licensors == total
        l = Licensor.new(name: array[1], address: "#{array[2]}\n#{array[3]}\n#{array[4]}")
        l.save!
        array.shift(5)
        licensors += 1
      end
    end
  end

  def self.import_films
    File.open(Rails.root.join('data/Films.txt')) do |file|
      total = file.gets.to_i
      films = 0
      until films == total
        a = file.gets.split("\t")
        licensor = Licensor.find_by_name(a[8])
        if licensor && (licensor.email == nil || licensor.email == "")
          licensor.update(email: a[240].strip)
        end
        if !licensor && a[54] != "short"
          licensor = Licensor.create(name: a[8].strip, email: a[240].strip)
        end
        f = Film.new(
          title: a[1],
          short_film: a[54] == "short",
          label_id: 0,
          licensor_id: licensor ? licensor.id : nil,
          deal_type_id: a[241] == "Template A" ? 1 : (a[241] == "Template B" ? 2 : (a[241] == "Template B (Theat. Only)" ? 3 : (a[241] == "Template C" ? 4 : (a[241] == "Template D" ? 5 : (a[241] == "Template E" ? 6 : nil))))),
          days_statement_due: a[357],
          gr_percentage: a[326],
          mg: a[11],
          e_and_o: a[242],
          expense_cap: a[358],
          sage_id: a[276],
          royalty_notes: a[337]
        )
        # feature id
        f.save!

        unless f.short_film
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 1).update(value: a[243]) #Theatrical
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 2).update(value: a[244]) #Non-Theatrical
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 3).update(value: a[249]) #Video
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 4).update(value: a[253]) #Commercial Video
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 5).update(value: a[304]) #HVED
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 6).update(value: a[247]) #VOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 7).update(value: a[246]) #SVOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 8).update(value: a[307]) #TVOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 9).update(value: a[306]) #AVOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 10).update(value: a[305]) #FVOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 11).update(value: a[248]) #Other Internet
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 12).update(value: a[250]) #Ancillary
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 13).update(value: a[245]) #TV
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 14).update(value: a[251]) #Club
          
          RoyaltyReport.create(film_id: f.id, year: 2017, quarter: 1)
        end


        films += 1
      end
    end
  end

end
