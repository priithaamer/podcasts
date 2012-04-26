require 'sinatra'
require 'sinatra/reloader'

class ConfreaksPodcastsServer < Sinatra::Base

  configure :development do
    register Sinatra::Reloader
  end

  get '/' do
    'Testime'
  end
end
