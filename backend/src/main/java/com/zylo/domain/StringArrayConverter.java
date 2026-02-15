package com.zylo.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.sql.Array;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Converter
public class StringArrayConverter implements AttributeConverter<List<String>, Object> {

    @Override
    public Object convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        return attribute.toArray(new String[0]);
    }

    @Override
    public List<String> convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return Collections.emptyList();
        }

        if (dbData instanceof Array) {
            try {
                String[] array = (String[]) ((Array) dbData).getArray();
                return Arrays.asList(array);
            } catch (SQLException e) {
                throw new RuntimeException("Failed to convert SQL Array to List", e);
            }
        }

        if (dbData instanceof String[]) {
            return Arrays.asList((String[]) dbData);
        }

        return Collections.emptyList();
    }
}
