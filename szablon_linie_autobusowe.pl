#!/usr/bin/env perl
#
# Skrypt generujący szablon nawigacyjny po liniach autobusowych
#
# @see http://poznan.wikia.com/wiki/Szablon:Nawigacja_Linie_autobusowe
#
use common::sense;
use Data::Dumper;

my @linie = (
	{
		name => "Dzienne",
		lines => [45..55, 57..87, 89..98]
	},
	{
		name => "Pospieszne",
		lines => ["L"]
	},
	{
		name => "Podmiejskie",
		lines => [401, 405, 406, 412, 511, 512, 527, 602, 603, 610, 611, 614, 616, 651, 691, 701, 702, 703, 710, 716, 718, 719, 830, 832, 833, 891, 893, 901, 902, 904, 905, 907, 911]
	},
	{
		name => "Nocne",
		lines => [231..240, 242..249, 251..252, 400]
	},
	{
		name => "Turystyczne",
		lines => [100]
	},
	# historyczne
	{
		name => "Dzienne",
		lines => [1..5, 53, "79 bis", 86, 88, "95 bis", 99]
	},
	{
		name => "Pospieszne",
		lines => ["A".."C", "C bis", "D".."F", 401, 402]
	},
	{
		name => "Sezonowe",
		lines => ["62 bis", "J", "K", "P", "S", "S1", "W", "Z"]
	},
	{
		name => "Podmiejskie",
		lines => [101..121]
	},
	{
		name => "Nocne",
		lines => [241]
	},
	{
		name => "Specjalne",
		lines => ["E"]
	},
);

foreach my $sekcja (@linie) {
	my $lines = $sekcja->{lines};
	my @links;

	for (@{$lines}) {
		my $link = (/^\d/) ? "[[Linia autobusowa nr $_|$_]]" : "[[Linia autobusowa $_|$_]]";
		push(@links, $link);
	}

	# formatuj wiersze
	say "<tr>";
	say "<td align=\"right\">'''$sekcja->{name}''':</td>";
	say "<td align=\"left\" style=\"font-size: 0.95em\">" . join(" &middot; ", @links) . "</td>";
	say "</tr>";
}
