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
		lines => [45..55, 57..71, 73..85, 87, 89..98]
	},
	{
		name => "Pospieszne",
		lines => ["L"]
	},
	{
		name => "Podmiejskie",
		lines => [
			# Czerwonak / Murowana Goślina
			312, 320..323, 341, 342, 348, 396..398,
			# Swarzędz (połączenie z Poznaniem)
			401, 405, 406, 407, 412,
			# KOMBUS Kórnik (połączenie z Poznaniem)
			501, 511, 512, 527, # 502, 560, 561, 580..583, 590..592, 594..596,
			# TRANSLUB Luboń
			601, 602, 603, 610, 611, 614, 616, 651, 690, 691,
			# PUK Komorniki
			701..704, 710, 716, 727, 729,
			# TPBUS
			801, 802, 803, 804, 811, 812, 813, 821,
			# ROKBUS Rokietnica
			830, 832, 833, 882, 891, 893,
			# ZKP Sychy Las
			901, 902, 904, 905, 907, 911
		]
	},
	{
		name => "Nocne",
		lines => [
			231..240, 242..249, 251..252,
			# Swarzędz
			400
		]
	},
	{
		name => "Turystyczne",
		lines => [100]
	},
	# historyczne
	{
		name => "Dzienne",
		lines => [1..5, 53, 72, "79 bis", 86, 88, "95 bis", 99]
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
		lines => [101..123, 310, 718, 719, "NB"]
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
