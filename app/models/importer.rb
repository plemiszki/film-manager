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
          days_statement_due: a[357] == "" ? 30 : a[357],
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
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 5).update(value: a[247]) #VOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 6).update(value: a[246]) #SVOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 7).update(value: a[307]) #TVOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 8).update(value: a[306]) #AVOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 9).update(value: a[305]) #FVOD
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 10).update(value: a[248]) #Other Internet
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 11).update(value: a[250]) #Ancillary
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 12).update(value: a[245]) #TV
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 13).update(value: a[251]) #Club
          FilmRevenuePercentage.find_by(film_id: f.id, revenue_stream_id: 14).update(value: a[252]) #Jewish

          r = RoyaltyReport.create(film_id: f.id, year: 2016, quarter: 4, deal_id: f.deal_type_id, gr_percentage: f.gr_percentage, mg: f.mg, e_and_o: f.e_and_o, amount_paid: a[299], current_total_expenses: a[302], cume_total_expenses: a[303])
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 1, current_revenue: a[254], current_expense: a[277], cume_revenue: a[265], cume_expense: a[288], licensor_percentage: a[243]) #Theatrical
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 2, current_revenue: a[255], current_expense: a[278], cume_revenue: a[266], cume_expense: a[289], licensor_percentage: a[244]) #NT
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 3, current_revenue: a[260], current_expense: a[283], cume_revenue: a[271], cume_expense: a[294], licensor_percentage: a[249]) #Video
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 4, current_revenue: a[264], current_expense: a[287], cume_revenue: a[275], cume_expense: a[298], licensor_percentage: a[253]) #Com Vid
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 5, current_revenue: a[258], current_expense: a[281], cume_revenue: a[269], cume_expense: a[292], licensor_percentage: a[247]) #VOD
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 6, current_revenue: a[257], current_expense: a[280], cume_revenue: a[268].to_f + a[316].to_f, cume_expense: a[291].to_f + a[320].to_f, licensor_percentage: a[246]) #SVOD
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 7, current_revenue: a[311], current_expense: a[315], cume_revenue: a[319], cume_expense: a[323], licensor_percentage: a[307]) #TVOD
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 8, current_revenue: a[310], current_expense: a[314], cume_revenue: a[318], cume_expense: a[322], licensor_percentage: a[306]) #AVOD
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 9, current_revenue: a[309], current_expense: a[313], cume_revenue: a[317], cume_expense: a[321], licensor_percentage: a[305]) #FVOD
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 10, current_revenue: a[259], current_expense: a[282], cume_revenue: a[270], cume_expense: a[293], licensor_percentage: a[248]) #Other Internet
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 11, current_revenue: a[261], current_expense: a[284], cume_revenue: a[272], cume_expense: a[295], licensor_percentage: a[250]) #Ancillary
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 12, current_revenue: a[256], current_expense: a[279], cume_revenue: a[267], cume_expense: a[290], licensor_percentage: a[245]) #TV
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 13, current_revenue: a[262], current_expense: a[285], cume_revenue: a[273], cume_expense: a[296], licensor_percentage: a[251]) #Club
          RoyaltyRevenueStream.create(royalty_report_id: r.id, revenue_stream_id: 14, current_revenue: a[263], current_expense: a[286], cume_revenue: a[274], cume_expense: a[297], licensor_percentage: a[252]) #Club
        end

        films += 1
      end
    end
  end

end
