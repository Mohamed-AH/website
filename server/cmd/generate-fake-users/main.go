package main

import (
	"flag"
	"log"
	"os"
	"strconv"
	"testing"

	"github.com/the-clothing-loop/website/server/internal/app"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"

	Faker "github.com/jaswdr/faker"
)

var faker = Faker.New()

// Create more fake users that are connected to a Loop.
// This was written to be run connected to the Acceptance Database Server,
// and should be run in conjunction with `make tunnel-db-vps1`
//
// run the following to generate more
// `go run cmd/generate-fake-users/main.go 100`
func main() {
	repeat := 5
	flag.Parse()
	if a := flag.Arg(0); a != "" {
		n, _ := strconv.Atoi(a)
		if n > 1 {
			repeat = n
		}
	}

	os.Setenv("SERVER_ENV", app.EnvEnumAcceptance)
	os.Setenv("SERVER_NO_MIGRATE", "true")

	app.ConfigInit(".")
	db := app.DatabaseInit()

	t := &testing.T{}

	for i := 0; i < repeat; i++ {
		latitude := float64(faker.Int64Between(5219424, 5223461)) / 100000
		longitude := float64(faker.Int64Between(448153, 454333)) / 100000
		user, _ := mocks.MockUser(t, db, 4, mocks.MockChainAndUserOptions{
			IsChainAdmin:        false,
			OnlyEmailExampleCom: true,
			OverrideLongitude:   &longitude,
			OverrideLatitude:    &latitude,
		})

		log.Printf("Generated -> User\t(ID: %d)", user.ID)
	}
}
