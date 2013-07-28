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
		lines => [45..55, 57..98]
	},
	{
		name => "Pospieszne",
		lines => ["L"]
	},
	{
		name => "Podmiejskie",
		lines => [616, 911]
	},
	{
		name => "Nocne",
		lines => [231..249, 251..252]
	},
	{
		name => "Turystyczne",
		lines => [100]
	},
	# historyczne
	{
		name => "Dzienne",
		lines => [56, "62 bis", 99]
	},
	{
		name => "Pospieszne",
		lines => ["A".."F", "P"]
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
