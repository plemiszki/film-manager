class UpdateArtwork
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, trigger_id)
    job = Job.find_by_job_id(time_started)
    response = HTTParty.get("http://filmmovement.com/fm-api/products?key=#{ENV['CYBER_NY_API_KEY']}")
    films = {}
    response.each do |element|
      films[element["id"]] = element
    end

    new_url = nil
    Film.all.each_with_index do |film, film_index|
      if films[film.id.to_s]
        Film.find(film.id).update(artwork_url: films[film.id.to_s]["poster_image"])
        new_url = films[film.id.to_s]["poster_image"] if film.id.to_s == trigger_id.to_s
      end
      job.update({ current_value: film_index + 1 })
    end
    job.update!({ done: true, first_line: new_url })
  end

end
