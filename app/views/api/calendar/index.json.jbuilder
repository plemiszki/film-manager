json.array! @months do |month|
  json.dvdReleases month[:dvd_releases]
  json.tvodReleases month[:tvod_releases]
  json.svodReleases month[:svod_releases]
  json.avodReleases month[:avod_releases]
  json.clubReleases month[:club_releases]
end
