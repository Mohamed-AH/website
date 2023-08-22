//go:build !ci

package models_test

import (
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/internal/models"
	"github.com/the-clothing-loop/website/server/internal/tests/mocks"
)

var (
	CreatedAtNextDay  = time.Now().Add(-18 * time.Hour)
	CreatedAtNextWeek = time.Now().Add(-(24 * 8) * time.Hour)
	CreatedAtTwoMonth = time.Now().Add(-(24 * 63) * time.Hour)
)

func TestMailRetryGetDue(t *testing.T) {
	tests := []mocks.MockMailOptions{
		{
			CreatedAt:        CreatedAtNextDay,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_DAY,
			MaxRetryAttempts: models.MAIL_RETRY_NEXT_WEEK,
		}, {
			CreatedAt:        CreatedAtNextDay,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_DAY,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        CreatedAtNextWeek,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_WEEK,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        CreatedAtNextWeek,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_WEEK,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        CreatedAtTwoMonth,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_TWO_MONTHS,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
	}

	for _, o := range tests {
		expected := mocks.MockMail(t, db, o)
		t.Run(fmt.Sprintf("with next attempt %v max %v", o.NextRetryAttempt, o.MaxRetryAttempts), func(t *testing.T) {
			list, err := models.MailGetDueForResend(db)
			assert.NoError(t, err)
			assert.NotEmpty(t, list)
			var found *models.Mail
			for i := range list {
				m := list[i]
				if m.ID == expected.ID {
					found = m
					continue
				}
			}
			assert.NotNil(t, found)
			assert.Equal(t, expected.NextRetryAttempt, found.NextRetryAttempt)
		})
	}
}

func TestMailRetryGetDueHidden(t *testing.T) {
	tests := []mocks.MockMailOptions{
		{
			CreatedAt:        CreatedAtTwoMonth,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEVER,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        CreatedAtNextDay,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_TWO_MONTHS,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
	}

	for _, o := range tests {
		expected := mocks.MockMail(t, db, o)
		list, err := models.MailGetDueForResend(db)
		assert.NoError(t, err)

		t.Run(fmt.Sprintf("with next attempt %v max %v", o.NextRetryAttempt, o.MaxRetryAttempts), func(t *testing.T) {
			assert.NotEmpty(t, list)
			var found *models.Mail
			for i := range list {
				m := list[i]
				if m.ID == expected.ID {
					found = m
					continue
				}
			}
			assert.Nil(t, found)
		})
	}
}

func TestMailRetryNextBump(t *testing.T) {
	tests := []mocks.MockMailOptions{
		{
			CreatedAt:        CreatedAtNextDay,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_DAY,
			MaxRetryAttempts: models.MAIL_RETRY_NEXT_WEEK,
		}, {
			CreatedAt:        CreatedAtNextDay,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_DAY,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        CreatedAtNextWeek,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_WEEK,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        CreatedAtNextWeek,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_WEEK,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        CreatedAtTwoMonth,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_TWO_MONTHS,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
	}

	for _, o := range tests {
		expected := mocks.MockMail(t, db, o)
		t.Run(fmt.Sprintf("with next attempt %v max %v", o.NextRetryAttempt, o.MaxRetryAttempts), func(t *testing.T) {
			expectedID := expected.ID
			newErr := fmt.Errorf("NewError: %v", faker.Pet().Dog())
			expected.UpdateNextRetryAttempt(db, newErr)

			found := models.Mail{ID: expectedID}
			err := db.First(&found).Error
			if err != nil {
				assert.False(t, found.NextRetryAttempt > models.MAIL_RETRY_TWO_MONTHS)
			}
			if o.NextRetryAttempt+1 > o.MaxRetryAttempts {
				assert.Error(t, err)
				return
			}

			assert.Equal(t, o.NextRetryAttempt+1, found.NextRetryAttempt)
		})
	}
}

func TestMailRetryRemoveFromDB(t *testing.T) {
	tests := []mocks.MockMailOptions{
		{
			CreatedAt:        CreatedAtNextDay,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_DAY,
			MaxRetryAttempts: models.MAIL_RETRY_NEXT_DAY,
		},
		{
			CreatedAt:        CreatedAtNextDay,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_NEXT_WEEK,
			MaxRetryAttempts: models.MAIL_RETRY_NEXT_WEEK,
		},
		{
			CreatedAt:        CreatedAtNextWeek,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_TWO_MONTHS,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
		{
			CreatedAt:        CreatedAtNextWeek,
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_TWO_MONTHS,
			MaxRetryAttempts: models.MAIL_RETRY_NEXT_WEEK,
		},
		{
			CreatedAt:        time.Now().Add(-(1) * time.Hour),
			IsErr:            true,
			NextRetryAttempt: models.MAIL_RETRY_TWO_MONTHS,
			MaxRetryAttempts: models.MAIL_RETRY_TWO_MONTHS,
		},
	}

	for _, o := range tests {
		expected := mocks.MockMail(t, db, o)
		t.Run(fmt.Sprintf("with next attempt %v max %v", o.NextRetryAttempt, o.MaxRetryAttempts), func(t *testing.T) {
			expectedID := expected.ID
			newErr := fmt.Errorf("NewError: %v", faker.Pet().Dog())
			expected.UpdateNextRetryAttempt(db, newErr)

			found := models.Mail{ID: expectedID}
			err := db.First(&found).Error
			assert.Zero(t, found.CreatedAt)
			assert.Error(t, err)
		})
	}
}
