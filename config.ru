require 'bundler/setup'
require 'err_podcasts_server'
require 'confreaks_podcasts_server'

configure :development do
  Sinatra::Application.reset!
  use Rack::Reloader
end

map '/podcasts' do
  run ErrPodcastsServer
end

map '/confreaks' do
  run ConfreaksPodcastsServer
end
