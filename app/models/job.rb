class Job < ActiveRecord::Base

  enum(:status, [:running, :success, :failed, :killed])

  def self.clear_s3_objects
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    s3.bucket(ENV['S3_BUCKET']).clear!
  end

  def render_json
    self.as_json.deep_transform_keys { |k| k.to_s.camelize(:lower) }
  end

  def not_done?
    status == :running
  end

  def done?
    status != :running
  end

end
