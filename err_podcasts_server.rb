require 'sinatra'
require 'lib/podcast.rb'

class ErrPodcastsServer < Sinatra::Base

  get '/:podcast' do
    @podcast = Podcast.new(params[:podcast])
    erb :podcast
  end
end
