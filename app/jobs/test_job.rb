class TestJob < ActiveJob::Base
  queue_as :default

  def perform
    sleep(10)
    p 'wooooo'
  end
end
