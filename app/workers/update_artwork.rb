class UpdateArtwork
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started)
    job = Job.find_by_job_id(time_started)
    p HTTParty.get('http://filmmovement-staging.cybernydevelopment.com/api/products')

    Film.all.each_with_index do |film, film_index|
      # p film.artwork_url
      job.update({ current_value: film_index + 1 })
    end
    job.update!({ done: true })
  end

end
