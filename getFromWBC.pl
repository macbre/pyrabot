#!/usr/bin/env perl
use common::sense;
use LWP::Simple;

say "Checking dependencies...";
die "Install ddjvu" unless system("which ddjvu > /dev/null") == 0;
die "Install imagemagick" unless system("which convert > /dev/null") == 0;

die "Please provide WBC document ID" unless defined $ARGV[0];

my $id = $ARGV[0];
my $target = defined($ARGV[1]) ? $ARGV[1] : $id;

say "Fetching WBC document #$id as $target.jpg...";
my $url = "http://www.wbc.poznan.pl/dlibra/webtools?id=$id";

my $content = get $url;
die "Cannot fetch URL" unless defined $url;

# search from DJVU file
die "Cannot find DJVU file link" unless ($content =~ /hintViewComponentInit\((.*)content_url=([^\]]+)\'\)/);

my $djvu = "http://www.wbc.poznan.pl$2";
say "Fetching DJVU file from $djvu...";

open(my $fp, '>', "$id.djvu") or die("Cannot save DJVU file");
print $fp get $djvu;
close $djvu;

say "Converting to jpg...";

system("ddjvu -format=tiff -page=1 $id.djvu $id.tiff") == 0 or die("Cannot convert to tiff");
system("convert -quality 75 $id.tiff $target.jpg") == 0 or die("Cannot convert to JPG");

# clean up
unlink "$id.djvu";
unlink "$id.tiff";

say "File stored as $target.jpg";
say "Done!";
