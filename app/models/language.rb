class Language < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :film_languages, dependent: :destroy
  has_many :films, through: :film_languages
  has_many :alternate_audios, dependent: :destroy

  CODES = {
    cantonese: 'zh',
    catalan: 'ca',
    creole: 'bi',
    dutch: 'nl',
    farsi: 'fa',
    flemish: 'nl',
    greek: 'el',
    kazajo: 'kk',
    kyrgyz: 'ky',
    mandarin: 'zh',
    moldovan: 'ro',
    nyanja: 'ny',
    odia: 'or',
    romanian: 'ro',
    serbocroatian: 'sh',
    sinhala: 'si',
    spanish: 'es',
    tupi: 'gn',
  }

  def self.missing_iso_code
    obj = {}
    Language.all.each do |language|
      obj[language.name] = language.iso_code
    end
    result = []
    obj.each do |key, value|
      result << key if value.nil?
    end
    result
  end

  def iso_code
    key = name.downcase.gsub('-', '').gsub(' ', '').to_sym
    return CODES[key] unless CODES[key].nil?
    result = ISO_639.find_by_english_name(name)
    if result.nil?
      nil
    else
      result[2].present? ? result[2] : nil
    end
  end

end
