require 'rails_helper'

RSpec.describe ExportAndUploadSpreadsheet do
  let(:time_started) { Time.now.to_i.to_s }
  let(:job) { create(:job, job_id: time_started, current_value: 0) }
  let(:headers) { ['Group', 'Value'] }

  before do
    allow_any_instance_of(described_class).to receive(:upload_to_aws).and_return('https://example.com/file.xlsx')
  end

  after do
    FileUtils.rm_rf("#{Rails.root}/tmp/#{time_started}")
  end

  def build_service(rows, increment_job_column: nil)
    described_class.new(
      headers:              headers,
      rows:                 rows,
      job:                  job,
      filename:             'test.xlsx',
      increment_job_column: increment_job_column
    )
  end

  describe 'job progress' do
    context 'without increment_job_column' do
      it 'increments current_value after every row' do
        rows = [['A', 1], ['A', 2], ['B', 3]]
        build_service(rows).call
        expect(job.reload.current_value).to eq(3)
      end

      it 'sets current_value to 1 for a single row' do
        build_service([['A', 1]]).call
        expect(job.reload.current_value).to eq(1)
      end
    end

    context 'with increment_job_column' do
      it 'increments only when the column value changes' do
        rows = [['A', 1], ['A', 2], ['B', 3], ['B', 4]]
        build_service(rows, increment_job_column: 'Group').call
        expect(job.reload.current_value).to eq(2)
      end

      it 'increments for every row when all values are distinct' do
        rows = [['A', 1], ['B', 2], ['C', 3]]
        build_service(rows, increment_job_column: 'Group').call
        expect(job.reload.current_value).to eq(3)
      end

      it 'does not increment when all rows share the same value' do
        rows = [['A', 1], ['A', 2], ['A', 3]]
        build_service(rows, increment_job_column: 'Group').call
        expect(job.reload.current_value).to eq(1)
      end
    end
  end
end
