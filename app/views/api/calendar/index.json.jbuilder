json.months @months do |month|
  json.dvdReleases month[:dvd_releases]
  json.tvodReleases month[:tvod_releases]
  json.theatricalReleases month[:theatrical_releases]
  json.clubReleases month[:club_releases]
  json.fmPlusReleases month[:fm_plus_releases]
end
