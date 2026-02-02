require 'rails_helper'

RSpec.describe Licensor do

  describe 'email validation' do
    before do
      @licensor = Licensor.new(name: 'Test Licensor')
    end

    it 'allows a valid single email' do
      @licensor.email = 'steve@domain.com'
      @licensor.valid?
      expect(@licensor.errors[:email]).to be_empty
    end

    it 'allows multiple valid emails separated by semicolons' do
      @licensor.email = 'steve@domain.com;bob@domain.com'
      @licensor.valid?
      expect(@licensor.errors[:email]).to be_empty
    end

    it 'allows multiple valid emails with spaces around semicolons' do
      @licensor.email = 'steve@domain.com; bob@domain.com; alice@example.org'
      @licensor.valid?
      expect(@licensor.errors[:email]).to be_empty
    end

    it 'allows blank email' do
      @licensor.email = ''
      @licensor.valid?
      expect(@licensor.errors[:email]).to be_empty
    end

    it 'allows nil email' do
      @licensor.email = nil
      @licensor.valid?
      expect(@licensor.errors[:email]).to be_empty
    end

    it 'rejects an invalid single email' do
      @licensor.email = 'notanemail'
      @licensor.valid?
      expect(@licensor.errors[:email]).to eq ['contains invalid email address(es)']
    end

    it 'rejects when one email in a list is invalid' do
      @licensor.email = 'steve@domain.com; invalid; bob@domain.com'
      @licensor.valid?
      expect(@licensor.errors[:email]).to eq ['contains invalid email address(es)']
    end

    it 'rejects email missing domain' do
      @licensor.email = 'steve@'
      @licensor.valid?
      expect(@licensor.errors[:email]).to eq ['contains invalid email address(es)']
    end

    it 'rejects email missing @' do
      @licensor.email = 'stevedomain.com'
      @licensor.valid?
      expect(@licensor.errors[:email]).to eq ['contains invalid email address(es)']
    end
  end

end
