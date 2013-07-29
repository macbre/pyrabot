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
		lines => [527, 602, 603, 610, 611, 614, 616, 651, 691, 701, 702, 718, 719, 901, 902, 904, 905, 907, 911]
	},
	{
		name => "Nocne",
		lines => [231..240, 242..249, 251..252]
	},
	{
		name => "Turystyczne",
		lines => [100]
	},
	# historyczne
	{
		name => "Dzienne",
		lines => [56, 88, 99]
	},
	{
		name => "Pospieszne",
		lines => ["A".."F", 401, 402]
	},
	{
		name => "Sezonowe",
		lines => ["62 bis", "J", "K", "P", "S", "S1", "W", "Z"]
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
	say "\t<td>$sekcja->{name}</td>";
	say "\t<td>" . join(" &middot; ", @links) . "</td>";
	say "\t</td>";
	say "</tr>";
}
