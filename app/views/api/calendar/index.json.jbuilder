json.months @months do |month|
  json.dvdReleases month[:dvd_releases]
  json.tvodReleases month[:tvod_releases]
  json.svodReleases month[:svod_releases]
  json.theatricalReleases month[:theatrical_releases]
  json.clubReleases month[:club_releases]
end
