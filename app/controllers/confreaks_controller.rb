class ConfreaksController < ApplicationController
  
  def index
    @podcast = Podcast.find_by_code('confreaks')
    render 'podcasts/index.xml.erb'
  end
end